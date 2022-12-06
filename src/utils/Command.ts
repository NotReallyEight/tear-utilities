import type { Message } from "discord.js";
import type { Client } from "./Client";
import { Logger } from "./Logger";

export type CommandRequirements = {
	custom?: (
		message: Message,
		args: string[],
		client: Client
	) => Promise<boolean> | boolean;
};

export type CommandFn = {
	(message: Message, args: string[], client: Client): void;
};

export type CommandOptions = {
	description?: string;
	expectedArguments?: string;
};

export class Command {
	names: string[];
	fn: CommandFn;
	requirements: CommandRequirements;
	description?: string;
	expectedArguments?: string;
	constructor(
		names: string[] | string,
		fn: CommandFn,
		requirements?: CommandRequirements,
		options?: CommandOptions
	) {
		if (Array.isArray(names)) this.names = names;
		else this.names = [names];

		if (!this.names[0]) Logger.error("No command names set.");
		this.fn = fn;
		this.requirements = {};
		if (requirements)
			if (requirements.custom) this.requirements.custom = requirements.custom;

		if (options?.description != null) this.description = options.description;

		if (options?.expectedArguments != null)
			this.expectedArguments = options.expectedArguments;
	}

	public async checkPermissions(
		message: Message,
		args: string[],
		client: Client
	): Promise<boolean> {
		return this.enoughRequirements(this.requirements, message, args, client);
	}

	public async execute(
		message: Message,
		args: string[],
		client: Client
	): Promise<boolean> {
		if (!(await this.checkPermissions(message, args, client))) return false;

		this.fn(message, args, client);

		return true;
	}

	private async enoughRequirements(
		requirements: CommandRequirements,
		message: Message,
		args: string[],
		client: Client
	): Promise<boolean> {
		const { custom } = requirements;

		if (custom && !(await custom(message, args, client))) return false;

		return true;
	}
}
