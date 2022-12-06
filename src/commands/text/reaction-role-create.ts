import { ButtonBuilder } from "@discordjs/builders";
import type { APIEmbed } from "discord-api-types/v9";
import { ActionRowBuilder, ButtonStyle, ComponentType } from "discord.js";
import { config } from "../../config";
import { Command } from "../../utils/Command";
import { Logger } from "../../utils/Logger";

export const command = new Command(
	["reaction-role-create", "rrc"],
	async (message) => {
		try {
			const embed: Omit<APIEmbed, "type"> = {
				title: "Get some roles!",
				description: "Click one of the buttons below to get some cool roles!",
				color: config.commandsEmbedsColor,
			};

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder({
					custom_id: "color-roles-button",
					disabled: false,
					label: "Color Roles",
					style: ButtonStyle.Primary,
					type: ComponentType.Button,
				}),
				new ButtonBuilder({
					custom_id: "pronoun-roles-button",
					disabled: false,
					label: "Pronoun Roles",
					style: ButtonStyle.Primary,
					type: ComponentType.Button,
				}),
				new ButtonBuilder({
					custom_id: "notification-roles-button",
					disabled: false,
					label: "Notification Roles",
					style: ButtonStyle.Primary,
					type: ComponentType.Button,
				}),
			]);

			await message.channel.send({
				embeds: [embed],
				components: [row],
			});
		} catch (err) {
			Logger.error(err);
			void message.channel.send(`Error: ${(err as Error).message}`);
		}
	},
	{
		custom: (message) => {
			if (message.author.id !== "489031280147693568") return false;
			return true;
		},
	}
);
