import type { ButtonInteraction } from "discord.js";
import type { Client } from "./Client";

export type ButtonEventFn = (
	interaction: ButtonInteraction,
	client: Client
) => Promise<void> | void;

export interface ButtonEventRequirements {
	custom?: (
		interaction: ButtonInteraction,
		client: Client
	) => Promise<boolean> | boolean;
}

export default class ButtonEvent {
	name: string;
	fn: ButtonEventFn;
	requirements: ButtonEventRequirements;
	constructor(
		name: string,
		fn: ButtonEventFn,
		requirements?: ButtonEventRequirements
	) {
		this.name = name;
		this.fn = fn;
		this.requirements = {};
		if (requirements)
			if (requirements.custom)
				Object.defineProperty(this.requirements, "custom", {
					value: requirements.custom,
					writable: false,
				});
	}

	async checkPermissions(
		interaction: ButtonInteraction,
		client: Client
	): Promise<boolean> {
		return this._enoughRequirements(this.requirements, interaction, client);
	}

	async execute(
		interaction: ButtonInteraction,
		client: Client
	): Promise<boolean> {
		if (!(await this.checkPermissions(interaction, client))) return false;
		void this.fn(interaction, client);

		return true;
	}

	private async _enoughRequirements(
		requirements: ButtonEventRequirements,
		interaction: ButtonInteraction,
		client: Client
	) {
		const { custom } = requirements;

		if (custom && !(await custom(interaction, client))) return false;

		return true;
	}
}
