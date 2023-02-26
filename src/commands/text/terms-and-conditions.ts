import type { APIEmbed } from "discord-api-types/v9";
import type { GuildTextBasedChannel, StageChannel } from "discord.js";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { config } from "../../config";
import { Command } from "../../utils/Command";
import { Logger } from "../../utils/Logger";

export const command = new Command(
	"terms-and-conditions",
	(message) => {
		const channel = message.channel as Exclude<
			GuildTextBasedChannel,
			StageChannel
		>;
		try {
			let ourLinks = "";
			const readerStream = createReadStream(
				join(cwd(), "assets", "terms-and-conditions.txt")
			);

			readerStream.on("data", (chunk) => {
				ourLinks += chunk;
			});

			readerStream.on("end", () => {
				const embeds: Omit<APIEmbed, "type">[] = [];
				embeds.push({
					title: "Terms And Conditions",
					description: ourLinks,
					color: config.commandsEmbedsColor,
				});
				void channel.send({
					embeds,
				});
			});
		} catch (err) {
			Logger.error(err);
			void channel.send(`Error: ${(err as Error).message}`);
		}
	},
	{
		custom: (message) => {
			if (message.author.id !== "489031280147693568") return false;
			return true;
		},
	}
);

