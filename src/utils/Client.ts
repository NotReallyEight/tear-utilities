import Discord from "discord.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "./Command";
import type { Event } from "./Event";
import type { SlashCommand } from "./SlashCommand";
import { REST } from "@discordjs/rest";
import type { RESTPostAPIApplicationGuildCommandsJSONBody } from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import { config } from "../config";
import { Logger } from "./Logger";
import type { ComponentEvent } from "./ComponentEvent";
import { MongoClient } from "mongodb";

export interface ClientOptions extends Discord.ClientOptions {
	prefix: string;
	token: string;
}

export interface EventImport {
	event: Event<keyof Discord.ClientEvents>;
}

export interface ComponentEventImport {
	event: ComponentEvent;
}

export interface CommandImport {
	command: Command;
}

export interface SlashCommandImport {
	command: SlashCommand;
}

export class Client extends Discord.Client {
	commands: Command[] = [];
	componentEvents: ComponentEvent[] = [];
	levelDates: Map<string, Date> = new Map();
	mongoClient = new MongoClient(config.mongoDB.connectionString);
	prefix: string;
	readyPromise: Promise<void>;
	restClient?: REST;
	slashCommands: SlashCommand[] = [];
	private resolvePromise!: (arg: any) => void;
	constructor(options: ClientOptions) {
		super(options);
		this.prefix = options.prefix;
		this.restClient = new REST({
			version: "9",
		}).setToken(config.token);
		this.readyPromise = new Promise((resolve) => {
			this.resolvePromise = resolve;
		});

		this.once("ready", this.resolvePromise);
	}

	public addCommands(path: string): this {
		const commandFiles = readdirSync(path);

		for (const file of commandFiles.filter((f) => f.endsWith(".js"))) {
			const { command } = require(join(path, file)) as CommandImport;

			this.commands.push(command);
		}
		return this;
	}

	public addComponentEvents(path: string): this {
		const eventFiles = readdirSync(path);

		for (const file of eventFiles.filter((f) => f.endsWith(".js"))) {
			const { event } = require(join(path, file)) as ComponentEventImport;

			this.componentEvents.push(event);
		}

		return this;
	}

	public async addSlashCommands(path: string): Promise<this> {
		try {
			await this.readyPromise;
			const commandFiles = readdirSync(path);
			const commands: RESTPostAPIApplicationGuildCommandsJSONBody[] = [];

			for (const file of commandFiles.filter((f) => f.endsWith(".js"))) {
				const { command } = require(join(path, file)) as SlashCommandImport;

				this.slashCommands.push(command);

				commands.push({
					default_permission: command.options?.defaultPermission,
					type: command.type,
					name: command.name,
					description: command.description,
					options: command.options?.options ?? undefined,
					name_localizations: command.nameLocalizations,
					description_localizations: command.descriptionLocalizations,
				});
			}

			await this.restClient!.put(
				Routes.applicationGuildCommands(this.user!.id, config.guildId),
				{
					body: commands,
				}
			);
		} catch (error: any) {
			Logger.error((error as Error).message);
		}

		return this;
	}

	public addEvents(path: string): this {
		const eventFiles = readdirSync(path);

		for (const file of eventFiles.filter((f) => f.endsWith(".js"))) {
			const { event } = require(join(path, file)) as EventImport;

			if (event.once ?? false)
				this.once(event.event, (...args) => {
					void event.listener(this, ...args);
				});
			else
				this.on(event.event, (...args) => {
					void event.listener(this, ...args);
				});
		}
		return this;
	}

	public async connectMongoDatabase(): Promise<void> {
		try {
			await this.mongoClient.connect();

			Logger.info("Connected to MongoDB.");
		} catch (error) {
			Logger.error((error as Error).message);
		}
	}

	public getPrefixesForMessage(message: Discord.Message): string[] {
		if (message.content.match(this.mentionPrefixRegExp()!)?.length != null)
			return [`<@!${this.user!.id}>`];

		return [this.prefix];
	}

	public hasCommand(
		message: Discord.Message
	): [string, string, ...string[]] | null {
		const matchResult = this.splitPrefixFromContent(message);
		if (!matchResult) return null;

		const [prefix, content] = matchResult;

		if (!content) {
			if (!prefix || !prefix.match(this.mentionPrefixRegExp()!)) return null;
			return [prefix, ""];
		}

		const args = content.split(" ").filter((arg) => arg !== "");
		const commandName = args.shift();
		if (commandName === undefined) return null;
		return [prefix, commandName.toLowerCase(), ...args];
	}

	public mentionPrefixRegExp(): RegExp | null {
		if (this.user) return new RegExp(`^<@!?${this.user.id}>\\s?`);
		return null;
	}

	public processAutocompleteInteraction(
		interaction: Discord.AutocompleteInteraction
	): boolean {
		return Boolean(
			this.slashCommands
				.find((c) => c.name === interaction.commandName)
				?.executeAutocomplete(interaction, this)
		);
	}

	public async processCommand(message: Discord.Message): Promise<boolean> {
		const commandInformation = this.hasCommand(message);
		if (!commandInformation) return false;
		const [_prefix, commandName, ...args] = commandInformation;

		const command =
			this.commands.find((c) => c.names.includes(commandName)) ?? null;

		if (!command) return false;

		await command.execute(message, args, this);

		return true;
	}

	public async processSlashCommand(
		interaction: Discord.BaseCommandInteraction
	): Promise<boolean> {
		const command = this.slashCommands.find(
			(c) => c.name === interaction.commandName
		);

		if (!command) return false;

		await command.execute(interaction, this);

		return true;
	}

	public splitPrefixFromContent(
		message: Discord.Message
	): [string, string] | null {
		const prefixes = this.getPrefixesForMessage(message);

		for (const prefix of prefixes)
			if (message.content.toLowerCase().startsWith(prefix.toLowerCase()))
				return [prefix, message.content.slice(prefix.length)];

		const match = message.content.match(this.mentionPrefixRegExp()!);
		if (match) return [match[0], message.content.slice(match[0].length)];

		if (!(message.channel instanceof Discord.GuildChannel))
			return ["", message.content];

		return null;
	}

	public async wait(milliseconds: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, milliseconds);
		});
	}
}
