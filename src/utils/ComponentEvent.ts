import type { MessageComponentInteraction } from "discord.js";
import type { Client } from "./Client";

export type ButtonEventFn = (
	interaction: MessageComponentInteraction,
	client: Client
) => Promise<void> | void;

export type ComponentEventRequirements = {
	custom?: (
		interaction: MessageComponentInteraction,
		client: Client
	) => Promise<boolean> | boolean;
};

export class ComponentEvent {
	name: string;
	fn: ButtonEventFn;
	requirements: ComponentEventRequirements;
	constructor(
		name: string,
		fn: ButtonEventFn,
		requirements?: ComponentEventRequirements
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
		interaction: MessageComponentInteraction,
		client: Client
	): Promise<boolean> {
		return this._enoughRequirements(this.requirements, interaction, client);
	}

	async execute(
		interaction: MessageComponentInteraction,
		client: Client
	): Promise<boolean> {
		if (!(await this.checkPermissions(interaction, client))) return false;
		void this.fn(interaction, client);

		return true;
	}

	private async _enoughRequirements(
		requirements: ComponentEventRequirements,
		interaction: MessageComponentInteraction,
		client: Client
	) {
		const { custom } = requirements;

		if (custom && !(await custom(interaction, client))) return false;

		return true;
	}
}
