import { Event } from "../../utils/Event";
import { config } from "../../config";
import type { APIEmbed } from "discord-api-types/v9";
import { Logger } from "../../utils/Logger";

export const event = new Event(
	"messageReactionRemove",
	async (client, reaction, user) => {
		try {
			if (reaction.message.id === "931837510408089622" || user.bot) return;

			const channel = client.channels.cache.get(config.logs.suggestions)!;

			if (!channel.isText()) return;

			const message = await channel.messages.fetch(reaction.message.id)!;

			if (
				message.channel.id !== config.logs.suggestions ||
				message.guild == null
			)
				return;

			const embed: APIEmbed = {
				title: message.embeds[0].title!,
				description: message.embeds[0].description!,
				footer: {
					text: "",
					icon_url: message.embeds[0].footer!.iconURL,
				},
				color: config.commandsEmbedsColor,
			};

			switch (reaction.emoji.name) {
				case "👍":
				case "👎":
					embed.footer!.text = `Upvotes : ${
						message.reactions.cache.get("👍")!.count - 1
					} | Downvotes : ${message.reactions.cache.get("👎")!.count - 1}`;
					break;

				default:
					break;
			}

			await message.edit({
				embeds: [embed],
			});
		} catch (err) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	}
);
