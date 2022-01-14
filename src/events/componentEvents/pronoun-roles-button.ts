import type { GuildMemberRoleManager } from "discord.js";
import { MessageActionRow } from "discord.js";
import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";

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

			const row = new MessageActionRow().addComponents([
				{
					customId: "pronoun-roles-select",
					disabled: false,
					maxValues: 3,
					minValues: 0,
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
					type: "SELECT_MENU",
				},
			]);

			await interaction.reply({
				ephemeral: true,
				content: "Please select your pronouns:",
				components: [row],
			});
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	}
);
