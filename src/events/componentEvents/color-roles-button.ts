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

			for (const role of Object.values(config.roles))
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
					minValues: 1,
					options: [
						{
							label: "Black",
							value: `color-roles-${config.roles.black}`,
							description: "Black like the night!",
							emoji: "🌙",
							default: colorRole?.id === config.roles.black,
						},
						{
							label: "Blue",
							value: `color-roles-${config.roles.blue}`,
							description: "Blue like the sky!",
							emoji: "🏞️",
							default: colorRole?.id === config.roles.blue,
						},
						{
							label: "Blurple",
							value: `color-roles-${config.roles.blurple}`,
							description: "Blurple like Discord!",
							emoji: "<:tp_discord_logo:931199150865911828>",
							default: colorRole?.id === config.roles.blurple,
						},
						{
							label: "Green",
							value: `color-roles-${config.roles.green}`,
							description: "Green like the grass!",
							emoji: "🌱",
							default: colorRole?.id === config.roles.green,
						},
						{
							label: "Orange",
							value: `color-roles-${config.roles.orange}`,
							description: "Orange like an orange!",
							emoji: "🍊",
							default: colorRole?.id === config.roles.orange,
						},
						{
							label: "Pink",
							value: `color-roles-${config.roles.pink}`,
							description: "Pink like a rose!",
							emoji: "🌹",
							default: colorRole?.id === config.roles.pink,
						},
						{
							label: "Purple",
							value: `color-roles-${config.roles.purple}`,
							description: "Purple like grapes!",
							emoji: "🍇",
							default: colorRole?.id === config.roles.purple,
						},
						{
							label: "Red",
							value: `color-roles-${config.roles.red}`,
							description: "Red like the fire!",
							emoji: "🔥",
							default: colorRole?.id === config.roles.red,
						},
						{
							label: "White",
							value: `color-roles-${config.roles.white}`,
							description: "White like the snow!",
							emoji: "🌨",
							default: colorRole?.id === config.roles.white,
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
