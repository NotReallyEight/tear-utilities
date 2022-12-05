import type {
	APIApplicationCommandOption,
	APIApplicationCommandPermission,
	Locale,
} from "discord-api-types/v9";
import { ApplicationCommandType } from "discord-api-types/v9";
import type Discord from "discord.js";
import type {
	AutocompleteInteraction,
	BaseCommandInteraction,
} from "discord.js";
import type { Client } from "./Client";

export type SlashCommandRequirements = {
	custom?: (
		interaction: Discord.BaseCommandInteraction,
		client: Client
	) => Promise<boolean> | boolean;
	permissions?: APIApplicationCommandPermission[];
};

export type CommandFn = {
	(
		interaction: Discord.BaseCommandInteraction,
		client: Client
	): Promise<void> | void;
};

export type CommandOptions = {
	nameLocalizations?: Partial<Record<Locale, string | null>>;
	description: string;
	descriptionLocalizations?: Partial<Record<Locale, string | null>>;
	options?: APIApplicationCommandOption[];
	defaultPermission?: boolean;
	type: ApplicationCommandType;
};

export type AutocompleteFn = {
	(
		interaction: Discord.AutocompleteInteraction,
		client: Client
	): Promise<void> | void;
};

export class SlashCommand {
	autocomplete?: AutocompleteFn;
	name: string;
	nameLocalizations?: Partial<Record<Locale, string | null>>;
	descriptionLocalizations?: Partial<Record<Locale, string | null>>;
	description: string;
	fn: CommandFn;
	requirements: SlashCommandRequirements;
	options?: CommandOptions;
	type: ApplicationCommandType;
	constructor(
		name: string,
		fn: CommandFn,
		autocomplete?: AutocompleteFn,
		requirements?: SlashCommandRequirements,
		options?: CommandOptions
	) {
		this.name = name;
		this.nameLocalizations = options?.nameLocalizations;
		this.descriptionLocalizations = options?.descriptionLocalizations;
		this.fn = fn;
		this.autocomplete = autocomplete;
		this.requirements = {};
		if (requirements) {
			if (requirements.custom) this.requirements.custom = requirements.custom;
			if (requirements.permissions)
				this.requirements.permissions = requirements.permissions;
		}

		if (options) {
			this.options = options;
			this.description = options.description;
			this.type = options.type;
		} else {
			this.description = "A command with no description!";
			this.type = ApplicationCommandType.ChatInput;
		}
	}

	public async checkPermissions(
		interaction: Discord.BaseCommandInteraction,
		client: Client
	): Promise<boolean> {
		return this.enoughRequirements(this.requirements, interaction, client);
	}

	public async execute(
		interaction: BaseCommandInteraction,
		client: Client
	): Promise<boolean> {
		if (!(await this.checkPermissions(interaction, client))) return false;

		void this.fn(interaction, client);

		return true;
	}

	public executeAutocomplete(
		interaction: AutocompleteInteraction,
		client: Client
	): boolean {
		if (!this.autocomplete) return false;
		void this.autocomplete(interaction, client);

		return true;
	}

	private async enoughRequirements(
		requirements: SlashCommandRequirements,
		interaction: Discord.BaseCommandInteraction,
		client: Client
	): Promise<boolean> {
		const { custom } = requirements;

		if (custom && !(await custom(interaction, client))) return false;

		return true;
	}
}
