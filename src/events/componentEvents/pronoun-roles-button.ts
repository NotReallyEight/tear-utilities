import type { GuildMemberRoleManager, Role } from "discord.js";
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

			let colorRole: Role | undefined;

			for (const role of Object.values(config.roles.pronounRoles))
				if (
					(interaction.member.roles as GuildMemberRoleManager).cache.has(role)
				) {
					colorRole = (
						interaction.member.roles as GuildMemberRoleManager
					).cache.get(role);
					break;
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
							default: colorRole?.id === config.roles.pronounRoles.he,
						},
						{
							label: "She/Her",
							value: `pronoun-roles-${config.roles.pronounRoles.she}`,
							default: colorRole?.id === config.roles.pronounRoles.she,
						},
						{
							label: "They/Them",
							value: `pronoun-roles-${config.roles.pronounRoles.they}`,
							default: colorRole?.id === config.roles.pronounRoles.they,
						},
					],
					type: "SELECT_MENU",
				},
			]);

			await interaction.reply({
				ephemeral: true,
				content: "Please select one of the following roles:",
				components: [row],
			});
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	}
);
