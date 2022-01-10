import { Command } from "../../utils/Command";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";

export const command = new Command("rules", (message) => {
	try {
		let rules = "";
		const readerStream = createReadStream(
			join(__dirname, "..", "..", "..", "assets", "rules.txt")
		);

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
	} catch (err: any) {
		Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
	}
});
