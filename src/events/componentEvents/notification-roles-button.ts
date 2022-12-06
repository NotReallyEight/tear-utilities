import { StringSelectMenuBuilder } from "@discordjs/builders";
import type { GuildMemberRoleManager } from "discord.js";
import { ActionRowBuilder, ComponentType } from "discord.js";
import { config } from "../../config";
import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";

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

			const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				[
					new StringSelectMenuBuilder({
						custom_id: "notification-roles-select",
						disabled: false,
						max_values: Object.keys(config.roles.notificationRoles).length,
						min_values: 0,
						options: [
							{
								label: "Announcement Ping",
								emoji: { name: "tp_announcement", id: "931508832557993994" },
								value: `notification-roles-${config.roles.notificationRoles.announcement}`,
								default: notificationRoles.includes(
									config.roles.notificationRoles.announcement
								),
							},
							{
								label: "Chat Revive Ping",
								emoji: { name: "tp_chat", id: "988138908984438834" },
								value: `notification-roles-${config.roles.notificationRoles.chat}`,
								default: notificationRoles.includes(
									config.roles.notificationRoles.chat
								),
							},
							{
								label: "Event Ping",
								emoji: { name: "🎉" },
								value: `notification-roles-${config.roles.notificationRoles.event}`,
								default: notificationRoles.includes(
									config.roles.notificationRoles.event
								),
							},
							{
								label: "Giveaway Ping",
								emoji: { name: "🎉" },
								value: `notification-roles-${config.roles.notificationRoles.giveaway}`,
								default: notificationRoles.includes(
									config.roles.notificationRoles.giveaway
								),
							},
							{
								label: "Poll Ping",
								emoji: { name: "tp_poll", id: "931509382334787645" },
								value: `notification-roles-${config.roles.notificationRoles.poll}`,
								default: notificationRoles.includes(
									config.roles.notificationRoles.poll
								),
							},
						],
						type: ComponentType.StringSelect,
					}),
				]
			);

			await interaction.reply({
				ephemeral: true,
				content: "Please select your roles based on the pings you want:",
				components: [row],
			});
		} catch (err) {
			Logger.error(err);
		}
	}
);
