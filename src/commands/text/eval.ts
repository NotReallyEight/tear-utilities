import util from "node:util";
import prettier from "prettier";
import { config } from "../../config";
import { Command } from "../../utils/Command";
import { Logger } from "../../utils/Logger";

/**
 * Inspect an eval result.
 * @param value - The value to inspect
 * @returns A string representation of the value
 */
const inspect = (value: unknown) => {
	switch (typeof value) {
		case "string":
			return value;
		case "bigint":
		case "number":
		case "boolean":
		case "function":
		case "symbol":
			return value.toString();
		case "object":
			return util.inspect(value);
		default:
			return "undefined";
	}
};

export const command = new Command(
	"eval",
	async (message, args, _client) => {
		try {
			let result,
				text = args.join(" "),
				typeOfResult;

			try {
				text = prettier
					.format(text, {
						...((await prettier
							.resolveConfig(".prettierrc.json")
							.catch(() => null)) ?? {}),
					})
					.slice(0, -1);
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
								value: `\`\`\`js\n${text.slice(0, 2048 - 9)}\`\`\``,
							},
							{
								name: "Output",
								value: `\`\`\`js\n${result.slice(0, 2048 - 9)}\`\`\``,
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
