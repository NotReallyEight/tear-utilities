import { REST } from "@discordjs/rest";
import type { RESTPostAPIApplicationGuildCommandsJSONBody } from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	ClientEvents,
	ClientOptions as DiscordClientOptions,
	Message,
} from "discord.js";
import { Client as DiscordClient, GuildChannel } from "discord.js";
import { MongoClient } from "mongodb";
import { readdirSync } from "node:fs";
import { URL } from "node:url";
import { config } from "../config";
import type { Command } from "./Command";
import type { ComponentEvent } from "./ComponentEvent";
import type { Event } from "./Event";
import { Logger } from "./Logger";
import type { SlashCommand } from "./SlashCommand";

export type ClientOptions = DiscordClientOptions & {
	prefix: string;
	token: string;
};

export type EventImport = {
	event: Event<keyof ClientEvents>;
};

export type ComponentEventImport = {
	event: ComponentEvent;
};

export type CommandImport = {
	command: Command;
};

export type SlashCommandImport = {
	command: SlashCommand;
};

export class Client extends DiscordClient {
	commands: Command[] = [];
	componentEvents: ComponentEvent[] = [];
	levelDates: Map<string, Date> = new Map();
	mongoClient = new MongoClient(config.mongoDB.connectionString);
	prefix: string;
	readyPromise: Promise<void>;
	restClient?: REST;
	slashCommands: SlashCommand[] = [];
	private resolvePromise!: () => void;
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

	public async addCommands(input: string) {
		const commands = await Promise.all<CommandImport>(
			readdirSync(new URL(input, import.meta.url))
				.filter((f) => f.endsWith(".js"))
				.map((file) => import(`./${input}/${file}`))
		);

		for (const { command } of commands) this.commands.push(command);
	}

	public async addComponentEvents(input: string) {
		const events = await Promise.all<ComponentEventImport>(
			readdirSync(new URL(input, import.meta.url))
				.filter((f) => f.endsWith(".js"))
				.map((file) => import(`./${input}/${file}`))
		);

		for (const { event } of events) this.componentEvents.push(event);
		return this;
	}

	public async addSlashCommands(input: string): Promise<this> {
		try {
			await this.readyPromise;
			const commandFiles = await Promise.all<SlashCommandImport>(
				readdirSync(new URL(input, import.meta.url))
					.filter((f) => f.endsWith(".js"))
					.map((file) => import(`./${input}/${file}`))
			);
			const commands: RESTPostAPIApplicationGuildCommandsJSONBody[] = [];

			for (const { command } of commandFiles) {
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
		} catch (err) {
			Logger.error(err);
		}

		return this;
	}

	public async addEvents(input: string) {
		const eventFiles = await Promise.all<EventImport>(
			readdirSync(new URL(input, import.meta.url))
				.filter((f) => f.endsWith(".js"))
				.map((file) => import(`./${input}/${file}`))
		);

		for (const { event } of eventFiles)
			if (event.once ?? false)
				this.once(event.event, (...args) => {
					void event.listener(this, ...args);
				});
			else
				this.on(event.event, (...args) => {
					void event.listener(this, ...args);
				});
	}

	public async connectMongoDatabase(): Promise<void> {
		try {
			await this.mongoClient.connect();

			Logger.info("Connected to MongoDB.");
		} catch (err) {
			Logger.error(err);
		}
	}

	public getPrefixesForMessage(message: Message): string[] {
		if (message.content.match(this.mentionPrefixRegExp()!)?.length != null)
			return [`<@!${this.user!.id}>`];

		return [this.prefix];
	}

	public hasCommand(message: Message): [string, string, ...string[]] | null {
		const matchResult = this.splitPrefixFromContent(message);
		if (!matchResult) return null;

		const [prefix, content] = matchResult;

		if (!content) {
			if (!prefix.match(this.mentionPrefixRegExp()!)) return null;
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
		interaction: AutocompleteInteraction
	): boolean {
		return Boolean(
			this.slashCommands
				.find((c) => c.name === interaction.commandName)
				?.executeAutocomplete(interaction, this)
		);
	}

	public async processCommand(message: Message): Promise<boolean> {
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
		interaction: ChatInputCommandInteraction
	): Promise<boolean> {
		const command = this.slashCommands.find(
			(c) => c.name === interaction.commandName
		);

		if (!command) return false;

		await command.execute(interaction, this);

		return true;
	}

	public splitPrefixFromContent(message: Message): [string, string] | null {
		const prefixes = this.getPrefixesForMessage(message);

		for (const prefix of prefixes)
			if (message.content.toLowerCase().startsWith(prefix.toLowerCase()))
				return [prefix, message.content.slice(prefix.length)];

		const match = message.content.match(this.mentionPrefixRegExp()!);
		if (match) return [match[0], message.content.slice(match[0].length)];

		if (!(message.channel instanceof GuildChannel))
			return ["", message.content];

		return null;
	}

	public async wait(milliseconds: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, milliseconds);
		});
	}
}
