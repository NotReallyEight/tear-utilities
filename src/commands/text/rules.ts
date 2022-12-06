import { createReadStream } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { config } from "../../config";
import { Command } from "../../utils/Command";
import { Logger } from "../../utils/Logger";

export const command = new Command(
	"rules",
	(message) => {
		try {
			let rules = "";
			const readerStream = createReadStream(join(cwd(), "assets", "rules.txt"));

			readerStream.on("data", (chunk) => {
				rules += chunk;
			});

			readerStream.on("end", () => {
				void message.channel.send({
					embeds: [
						{
							title: "Rules",
							description: rules,
							color: config.commandsEmbedsColor,
						},
					],
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
