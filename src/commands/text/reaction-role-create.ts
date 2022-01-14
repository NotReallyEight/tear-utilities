import type { APIEmbed } from "discord-api-types";
import { MessageActionRow } from "discord.js";
import { config } from "../../config";
import { Command } from "../../utils/Command";
import { Logger } from "../../utils/Logger";

export const command = new Command(
	["reaction-role-create", "rrc"],
	async (message) => {
		try {
			const embed: APIEmbed = {
				title: "Get some roles!",
				description: "Click one of the buttons below to get some cool roles!",
				color: config.commandsEmbedsColor,
			};

			const row = new MessageActionRow().addComponents([
				{
					customId: "color-roles-button",
					disabled: false,
					label: "Color Roles",
					style: "PRIMARY",
					type: "BUTTON",
				},
				{
					customId: "pronoun-roles-button",
					disabled: false,
					label: "Pronoun Roles",
					style: "PRIMARY",
					type: "BUTTON",
				},
				{
					customId: "notification-roles-button",
					disabled: false,
					label: "Notification Roles",
					style: "PRIMARY",
					type: "BUTTON",
				},
			]);

			await message.channel.send({
				embeds: [embed],
				components: [row],
			});
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
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
