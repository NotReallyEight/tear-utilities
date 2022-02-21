import { Command } from "../../utils/Command";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";
import type { APIEmbed } from "discord-api-types/v9";

export const command = new Command(
	"server-info",
	(message) => {
		try {
			let serverInfo = "";
			const readerStream = createReadStream(
				join(__dirname, "..", "..", "..", "assets", "server-info.txt")
			);

			readerStream.on("data", (chunk) => {
				serverInfo += chunk;
			});

			readerStream.on("end", () => {
				const embeds: APIEmbed[] = [];
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

				void message.channel.send({
					embeds,
				});
			});

			readerStream.on("error", (err) => {
				Logger.error(`${err.name}: ${err.message}`);
			});
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	},
	{
		custom: (message) => {
			if (message.author.id !== "489031280147693568") return false;
			return true;
		},
	}
);
