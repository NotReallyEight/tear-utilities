import type { GuildMemberRoleManager } from "discord.js";
import { MessageActionRow } from "discord.js";
import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";

export const event = new ComponentEvent(
	"notification-roles-button",
	async (interaction) => {
		try {
			if (!interaction.isButton()) return;

			if (!interaction.inGuild()) return;

			const notificationRoles: string[] = [];

			for (const role of Object.values(config.roles.notificationRoles))
				if (
					(interaction.member.roles as GuildMemberRoleManager).cache.has(role)
				) {
					notificationRoles.push(
						(interaction.member.roles as GuildMemberRoleManager).cache.get(
							role
						)!.id
					);
					continue;
				}

			const row = new MessageActionRow().addComponents([
				{
					customId: "notification-roles-select",
					disabled: false,
					maxValues: 4,
					minValues: 0,
					options: [
						{
							label: "Announcement Ping",
							emoji: "<:tp_announcement:931508832557993994>",
							value: `notification-roles-${config.roles.notificationRoles.announcement}`,
							default: notificationRoles.includes(
								config.roles.notificationRoles.announcement
							),
						},
						{
							label: "Event Ping",
							emoji: "🎉",
							value: `notification-roles-${config.roles.notificationRoles.event}`,
							default: notificationRoles.includes(
								config.roles.notificationRoles.event
							),
						},
						{
							label: "Giveaway Ping",
							emoji: "🎉",
							value: `notification-roles-${config.roles.notificationRoles.giveaway}`,
							default: notificationRoles.includes(
								config.roles.notificationRoles.giveaway
							),
						},
						{
							label: "Poll Ping",
							emoji: "<:tp_poll:931509382334787645>",
							value: `notification-roles-${config.roles.notificationRoles.poll}`,
							default: notificationRoles.includes(
								config.roles.notificationRoles.poll
							),
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
