import type { BaseCommandInteraction } from "discord.js";
import type Discord from "discord.js";
import type { Client } from "./Client";

export interface SlashCommandRequirements {
	custom?: (
		interaction: Discord.BaseCommandInteraction,
		client: Client
	) => Promise<boolean> | boolean;
}

export interface CommandFn {
	(
		interaction: Discord.BaseCommandInteraction,
		client: Client
	): Promise<void> | void;
}

export interface CommandOptions {
	description: string;
	options?: Discord.ApplicationCommandOption[];
	defaultPermission?: boolean;
}

export class SlashCommand {
	name: string;
	description: string;
	fn: CommandFn;
	requirements: SlashCommandRequirements;
	options?: CommandOptions;
	constructor(
		name: string,
		fn: CommandFn,
		requirements?: SlashCommandRequirements,
		options?: CommandOptions
	) {
		this.name = name;
		this.fn = fn;
		this.requirements = {};
		if (requirements)
			if (requirements.custom) this.requirements.custom = requirements.custom;

		if (options) {
			this.options = options;
			this.description = options.description;
		} else this.description = "A command with no description!";
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
