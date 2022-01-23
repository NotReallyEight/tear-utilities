import { SlashCommand } from "../../utils/SlashCommand";
import { Logger } from "../../utils/Logger";
import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from "discord-api-types/v9";
import { config } from "../../config";
import type { ApplicationCommandOptionChoice } from "discord.js";

export const command = new SlashCommand(
	"suggestion",
	async (interaction, client) => {
		try {
			if (!interaction.isApplicationCommand() || !interaction.inCachedGuild())
				return;

			const suggestionsChannel = client.channels.cache.get(
				config.logs.suggestions
			)!;

			if (!suggestionsChannel.isText()) return;

			await interaction.deferReply();

			const suggestionMessages = await suggestionsChannel.messages.fetch({
				limit: 100,
			});

			// if interaction.options.data[0].name === accept then do something otherwise if it's decline do something else

			// interaction.options.data[0].options[0].value is the id of the suggestion

			const suggestionMessage = suggestionMessages
				.filter(
					(m) =>
						m.embeds.length > 0 &&
						m.embeds[0].title!.split("#")[1].length > 0 &&
						m.embeds[0].title!.split("#")[1] ===
							interaction.options.data[0]!.options![0].value
				)
				.first();

			if (!suggestionMessage) {
				await interaction.editReply("No suggestion found.");
				return;
			}

			await suggestionMessage.delete();

			const acceptedSuggestionsChannel = client.channels.cache.get(
				config.logs.approvedSuggestions
			)!;
			const declinedSuggestionsChannel = client.channels.cache.get(
				config.logs.declinedSuggestions
			)!;

			if (
				!acceptedSuggestionsChannel.isText() ||
				!declinedSuggestionsChannel.isText()
			)
				return;

			let content: string | null = "";

			if (
				!interaction.options.data[0].options ||
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				interaction.options.data[0].options[1] == null ||
				interaction.options.data[0].options[1].value == null
			)
				content = null;
			else
				content = `**Reason**: ${interaction.options.data[0].options[1].value.toString()}`;
			switch (interaction.options.data[0].name) {
				case "accept":
					suggestionMessage.embeds[0].title = `Suggestion Accepted #${
						suggestionMessage.embeds[0].title!.split("#")[1]
					}`;
					await acceptedSuggestionsChannel.send({
						content,
						embeds: suggestionMessage.embeds,
					});
					await interaction.editReply("Suggestion accepted.");
					break;

				case "decline":
					suggestionMessage.embeds[0].title = `Suggestion Declined #${
						suggestionMessage.embeds[0].title!.split("#")[1]
					}`;
					await declinedSuggestionsChannel.send({
						content,
						embeds: suggestionMessage.embeds,
					});
					await interaction.editReply("Suggestion declined.");
					break;

				default:
					break;
			}
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	},
	async (interaction, client) => {
		try {
			if (!interaction.isAutocomplete()) return;

			const suggestionsChannel = client.channels.cache.get(
				config.logs.suggestions
			)!;

			if (!suggestionsChannel.isText()) return;

			const suggestionsMessages = await suggestionsChannel.messages.fetch({
				limit: 100,
			});

			if (!suggestionsMessages.size) return;
			const toRespond: ApplicationCommandOptionChoice[] = [];
			switch (interaction.options.data[0].name) {
				case "accept":
				case "decline":
					if (
						!interaction.options.data[0].options ||
						interaction.options.data[0].options[0].value?.toString().length ==
							null
					)
						suggestionsMessages
							.filter(
								(m) =>
									m.embeds.length > 0 &&
									m.embeds[0].title!.split("#")[1].length > 0
							)
							.map((m) => m.embeds[0].title!.split("#")[1])
							.forEach((s) => {
								toRespond.push({
									name: s,
									value: s,
								});
							});
					else
						suggestionsMessages
							.filter(
								(m) =>
									m.embeds.length > 0 &&
									m.embeds[0].title!.split("#")[1].length > 0 &&
									m.embeds[0]
										.title!.split("#")[1]
										.startsWith(
											interaction.options.data[0].options![0].value!.toString()
										)
							)
							.map((m) => m.embeds[0].title!.split("#")[1])
							.forEach((s) => {
								toRespond.push({
									name: s,
									value: s,
								});
							});

					if (interaction.responded) break;

					if (toRespond.length > 25) toRespond.length = 25;

					await interaction.respond(toRespond);
					break;
				default:
					break;
			}
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	},
	{
		custom: (interaction) => {
			if (!interaction.isApplicationCommand() || !interaction.inCachedGuild())
				return false;

			if (interaction.member.roles.cache.has(config.roles.staffRole))
				return true;

			return false;
		},
	},
	{
		description: "Accept or decline a suggestion.",
		type: ApplicationCommandType.ChatInput,
		defaultPermission: true,
		options: [
			{
				description: "Accept a suggestion",
				name: "accept",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						description: "The ID of the suggestion",
						name: "id",
						type: ApplicationCommandOptionType.String,
						autocomplete: true,
						required: true,
					},
					{
						description: "The reason of the acceptance",
						name: "reason",
						type: ApplicationCommandOptionType.String,
						autocomplete: false,
						required: false,
					},
				],
			},
			{
				description: "Decline a suggestion",
				name: "decline",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						description: "The ID of the suggestion",
						name: "id",
						type: ApplicationCommandOptionType.String,
						autocomplete: true,
						required: true,
					},
					{
						description: "The reason of the denial",
						name: "reason",
						type: ApplicationCommandOptionType.String,
						autocomplete: false,
						required: false,
					},
				],
			},
		],
	}
);
