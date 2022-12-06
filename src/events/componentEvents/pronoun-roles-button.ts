import { StringSelectMenuBuilder } from "@discordjs/builders";
import type { GuildMemberRoleManager } from "discord.js";
import { ActionRowBuilder, ComponentType } from "discord.js";
import { config } from "../../config";
import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";

export const event = new ComponentEvent(
	"pronoun-roles-button",
	async (interaction) => {
		try {
			if (!interaction.isButton()) return;

			if (!interaction.inGuild()) return;

			const pronounRoles: string[] = [];

			for (const role of Object.values(config.roles.pronounRoles))
				if (
					(interaction.member.roles as GuildMemberRoleManager).cache.has(role)
				) {
					pronounRoles.push(
						(interaction.member.roles as GuildMemberRoleManager).cache.get(
							role
						)!.id
					);
					continue;
				}

			const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				[
					new StringSelectMenuBuilder({
						custom_id: "pronoun-roles-select",
						disabled: false,
						max_values: 3,
						min_values: 0,
						options: [
							{
								label: "He/Him",
								value: `pronoun-roles-${config.roles.pronounRoles.he}`,
								default: pronounRoles.includes(config.roles.pronounRoles.he),
							},
							{
								label: "She/Her",
								value: `pronoun-roles-${config.roles.pronounRoles.she}`,
								default: pronounRoles.includes(config.roles.pronounRoles.she),
							},
							{
								label: "They/Them",
								value: `pronoun-roles-${config.roles.pronounRoles.they}`,
								default: pronounRoles.includes(config.roles.pronounRoles.they),
							},
						],
						type: ComponentType.StringSelect,
					}),
				]
			);

			await interaction.reply({
				ephemeral: true,
				content: "Please select your pronouns:",
				components: [row],
			});
		} catch (err) {
			Logger.error(err);
		}
	}
);
