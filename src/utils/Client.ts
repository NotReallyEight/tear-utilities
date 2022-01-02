import Discord from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import type { Command } from "./Command";
import type { Event } from "./Event";
import type { SlashCommand } from "./SlashCommand";
import { REST } from "@discordjs/rest";
import type { RESTGetAPIApplicationGuildCommandsResult } from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import { config } from "../config";
import { Logger } from "./Logger";

export interface ClientOptions extends Discord.ClientOptions {
	prefix: string;
	token: string;
}

export interface EventImport {
	event: Event<keyof Discord.ClientEvents>;
}

export interface CommandImport {
	command: Command;
}

export interface SlashCommandImport {
	command: SlashCommand;
}

export class Client extends Discord.Client {
	commands: Command[] = [];
	componentEvents: any[] = [];
	prefix: string;
	restClient?: REST;
	slashCommands: SlashCommand[] = [];
	constructor(options: ClientOptions) {
		super(options);
		this.prefix = options.prefix;
		this.restClient = new REST({
			version: "9",
		}).setToken(config.token!);
	}

	public async addCommands(path: string): Promise<this> {
		const commandFiles = readdirSync(path);

		for (const file of commandFiles) {
			// eslint-disable-next-line no-await-in-loop
			const { command } = (await import(join(path, file))) as CommandImport;

			this.commands.push(command);
		}
		return this;
	}

	public async addSlashCommands(path: string): Promise<this> {
		const commandFiles = readdirSync(path);

		for (const file of commandFiles) {
			// eslint-disable-next-line no-await-in-loop
			const { command } = (await import(
				join(path, file)
			)) as SlashCommandImport;

			this.slashCommands.push(command);

			try {
				do
					// eslint-disable-next-line no-await-in-loop
					await this.wait(500);
				while (!this.user);
				// eslint-disable-next-line no-await-in-loop
				const commands = (await this.restClient?.get(
					Routes.applicationGuildCommands(this.user.id, config.guildId)
				)) as RESTGetAPIApplicationGuildCommandsResult;
				console.info(commands);
			} catch (error: any) {
				Logger.error((error as Error).message);
				console.log(error);
			}
		}

		return this;
	}

	public async addEvents(path: string): Promise<this> {
		const eventFiles = readdirSync(path);

		for (const file of eventFiles) {
			// eslint-disable-next-line no-await-in-loop
			const { event } = (await import(join(path, file))) as EventImport;

			event.computedListener = (...args): void => {
				void event.args[1](...args);
			};
			if (event.once ?? false) this.once(event.args[0], event.computedListener);
			else this.on(event.args[0], event.computedListener);
		}
		return this;
	}

	public mentionPrefixRegExp(): RegExp | null {
		if (this.user) return new RegExp(`^<@!?${this.user.id}>\\s?`);
		return null;
	}

	public async wait(milliseconds: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, milliseconds);
		});
	}
}
