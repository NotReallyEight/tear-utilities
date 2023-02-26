import type { GuildTextBasedChannel, StageChannel } from "discord.js";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { config } from "../../config";
import { Command } from "../../utils/Command";
import { Logger } from "../../utils/Logger";

export const command = new Command(
	"rules",
	(message) => {
		const channel = message.channel as Exclude<
			GuildTextBasedChannel,
			StageChannel
		>;
		try {
			let rules = "";
			const readerStream = createReadStream(join(cwd(), "assets", "rules.txt"));

			readerStream.on("data", (chunk) => {
				rules += chunk;
			});

			readerStream.on("end", () => {
				void channel.send({
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

