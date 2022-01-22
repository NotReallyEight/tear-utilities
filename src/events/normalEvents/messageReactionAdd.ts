import { Event } from "../../utils/Event";
import { config } from "../../config";
import type { APIEmbed } from "discord-api-types/v9";
import { Logger } from "../../utils/Logger";

export const event = new Event(
	"messageReactionAdd",
	async (client, reaction, user) => {
		try {
			if (
				!reaction.message.channel.isText() ||
				reaction.message.channel.id !== config.logs.suggestions ||
				reaction.message.id === "931837510408089622" ||
				user.bot
			)
				return;

			const channel = client.channels.cache.get(config.logs.suggestions)!;

			if (!channel.isText() || reaction.message.guild == null) return;

			const message = await channel.messages.fetch(reaction.message.id)!;

			if (message.channel.id !== config.logs.suggestions || message.guild == null) return;
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
					embed.footer!.text = `Upvotes : ${
						Number(
							message.embeds[0].footer!.text.split(" : ")[1].split(" | ")[0]
						) + 1
					} | Downvotes : ${message.embeds[0].footer!.text.split(" : ")[2]}`;
					break;

				case "👎":
					embed.footer!.text = `Upvotes : ${
						message.embeds[0].footer!.text.split(" : ")[1].split(" | ")[0]
					} | Downvotes : ${
						Number(message.embeds[0].footer!.text.split(" : ")[2]) + 1
					}`;
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
