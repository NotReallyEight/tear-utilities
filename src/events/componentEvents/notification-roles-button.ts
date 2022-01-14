import type { GuildMemberRoleManager, Role } from "discord.js";
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

			let colorRole: Role | undefined;

			for (const role of Object.values(config.roles.notificationRoles))
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
					customId: "notification-roles-select",
					disabled: false,
					maxValues: Object.keys(config.roles.notificationRoles).length,
					minValues: 0,
					options: [
						{
							label: "Announcement Ping",
							description: "Receive a ping when a new announcement is made!",
							emoji: "<:tp_announcement:931508832557993994>",
							value: `notification-roles-${config.roles.notificationRoles.announcement}`,
							default:
								colorRole?.id === config.roles.notificationRoles.announcement,
						},
						{
							label: "Event Ping",
							description: "Receive a ping when a new event is hosted!",
							emoji: "🎉",
							value: `notification-roles-${config.roles.notificationRoles.event}`,
							default: colorRole?.id === config.roles.notificationRoles.event,
						},
						{
							label: "Giveaway Ping",
							emoji: "🎉",
							description: "Receive a ping when a new giveaway is hosted!",
							value: `notification-roles-${config.roles.notificationRoles.giveaway}`,
							default:
								colorRole?.id === config.roles.notificationRoles.giveaway,
						},
						{
							label: "Poll Ping",
							emoji: "<:tp_poll:931509382334787645>",
							description: "Receive a ping when a new poll is published!",
							value: `notification-roles-${config.roles.notificationRoles.poll}`,
							default: colorRole?.id === config.roles.notificationRoles.poll,
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
