import { Command } from "../../utils/Command";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";
import type { APIEmbed } from "discord-api-types/v9";
import { cwd } from "node:process";
import type { GuildTextBasedChannel, StageChannel } from "discord.js";

export const command = new Command(
	"server-info",
	(message) => {
		const channel = message.channel as Exclude<
			GuildTextBasedChannel,
			StageChannel
		>;
		try {
			let serverInfo = "";
			const readerStream = createReadStream(
				join(cwd(), "assets", "server-info.txt")
			);

			readerStream.on("data", (chunk) => {
				serverInfo += chunk;
			});

			readerStream.on("end", () => {
				const embeds: Omit<APIEmbed, "type">[] = [];
				serverInfo.split("---").forEach((info, index) => {
					if (!index)
						embeds.push({
							title: "Server Info",
							description: info,
							color: config.commandsEmbedsColor,
						});
					else
						embeds.push({
							description: info,
							color: config.commandsEmbedsColor,
						});
				});

				void channel.send({
					embeds,
				});
			});

			readerStream.on("error", (err) => {
				Logger.error(`${err.name}: ${err.message}`);
			});
		} catch (err) {
			Logger.error(err);
		}
	},
	{
		custom: (message) => {
			if (message.author.id !== "489031280147693568") return false;
			return true;
		},
	}
);

