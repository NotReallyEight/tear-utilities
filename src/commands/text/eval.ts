import { config } from "../../config";
import { Command } from "../../utils/Command";
import { inspect } from "../../utils/inspect";
import { Logger } from "../../utils/Logger";

export const command = new Command(
	"eval",
	async (message, args, _client) => {
		try {
			const text = args.join(" ");
			let result, typeOfResult;

			try {
				result = (await eval(text)) as unknown;
				typeOfResult = typeof result;
				result = inspect(result);
			} catch (e) {
				typeOfResult = typeof e;
				result = inspect(e);
			}
			await message.channel.send({
				embeds: [
					{
						title: "Eval",
						color: config.commandsEmbedsColor,
						fields: [
							{
								name: "Input",
								value: `\`\`\`js\n${text.slice(0, 1024 - 9)}\`\`\``,
							},
							{
								name: "Output",
								value: `\`\`\`js\n${result.slice(0, 1024 - 9)}\`\`\``,
							},
							{
								name: "Type",
								value: `\`\`\`js\n${typeOfResult}\`\`\``,
							},
						],
					},
				],
			});
		} catch (err) {
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

