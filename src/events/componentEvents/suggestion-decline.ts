import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";
import type { GuildTextBasedChannel } from "discord.js";
import type { APIEmbed } from "discord-api-types/payloads";

export const event = new ComponentEvent(
	"suggestion-decline",
	async (interaction) => {
		try {
			if (!interaction.isButton() || !interaction.inCachedGuild()) return;

			await interaction.deferUpdate();

			const channel = interaction.guild.channels.cache.get(
				config.logs.declinedSuggestions
			) as GuildTextBasedChannel;

			await interaction.message.delete();

			const embed: APIEmbed = {
				title: "Suggestion Declined",
				description: interaction.message.embeds[0].description!,
				footer: interaction.message.embeds[0].footer!,
				color: config.commandsEmbedsColor,
			};

			await channel.send({
				embeds: [embed],
			});
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	}
);
