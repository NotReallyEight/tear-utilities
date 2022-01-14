import type { GuildMemberRoleManager, Role } from "discord.js";
import { MessageActionRow } from "discord.js";
import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";

export const event = new ComponentEvent(
	"color-roles-button",
	async (interaction) => {
		try {
			if (!interaction.isButton()) return;

			if (!interaction.inGuild()) return;

			let colorRole: Role | undefined;

			for (const role of Object.values(config.roles.colorRoles))
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
					customId: "color-roles-select",
					disabled: false,
					maxValues: 1,
					minValues: 0,
					options: [
						{
							label: "Black",
							value: `color-roles-${config.roles.colorRoles.black}`,
							description: "Black like the night!",
							emoji: "🌙",
							default: colorRole?.id === config.roles.colorRoles.black,
						},
						{
							label: "Blue",
							value: `color-roles-${config.roles.colorRoles.blue}`,
							description: "Blue like the sky!",
							emoji: "🏞️",
							default: colorRole?.id === config.roles.colorRoles.blue,
						},
						{
							label: "Blurple",
							value: `color-roles-${config.roles.colorRoles.blurple}`,
							description: "Blurple like Discord!",
							emoji: "<:tp_discord_logo:931199150865911828>",
							default: colorRole?.id === config.roles.colorRoles.blurple,
						},
						{
							label: "Green",
							value: `color-roles-${config.roles.colorRoles.green}`,
							description: "Green like the grass!",
							emoji: "🌱",
							default: colorRole?.id === config.roles.colorRoles.green,
						},
						{
							label: "Orange",
							value: `color-roles-${config.roles.colorRoles.orange}`,
							description: "Orange like an orange!",
							emoji: "🍊",
							default: colorRole?.id === config.roles.colorRoles.orange,
						},
						{
							label: "Pink",
							value: `color-roles-${config.roles.colorRoles.pink}`,
							description: "Pink like a rose!",
							emoji: "🌹",
							default: colorRole?.id === config.roles.colorRoles.pink,
						},
						{
							label: "Purple",
							value: `color-roles-${config.roles.colorRoles.purple}`,
							description: "Purple like grapes!",
							emoji: "🍇",
							default: colorRole?.id === config.roles.colorRoles.purple,
						},
						{
							label: "Red",
							value: `color-roles-${config.roles.colorRoles.red}`,
							description: "Red like the fire!",
							emoji: "🔥",
							default: colorRole?.id === config.roles.colorRoles.red,
						},
						{
							label: "White",
							value: `color-roles-${config.roles.colorRoles.white}`,
							description: "White like the snow!",
							emoji: "🌨",
							default: colorRole?.id === config.roles.colorRoles.white,
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
