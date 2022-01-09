import { Command } from "../../utils/Command";
import { readFileSync } from "fs";
import { join } from "path";
import { Logger } from "../../utils/Logger";

export const command = new Command(
	"rules",
	async (message) => {
		try {
			const rules = readFileSync(
				join(__dirname, "..", "..", "..", "assets", "rules.txt")
			).toString();

			await message.channel.send({
				embeds: [
					{
						title: "Rules",
						description: rules,
						color: 0x29abe2,
					},
				],
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
