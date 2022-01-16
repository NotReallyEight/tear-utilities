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
	(interaction) => {
		try {
			if (
				!interaction.isApplicationCommand() ||
				!interaction.inCachedGuild() ||
				!interaction.isAutocomplete()
			)
				return;
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	},
	async (interaction, client) => {
		try {
			const approvedSuggestionsChannel = client.channels.cache.get(
				config.logs.approvedSuggestions
			)!;

			const declinedSuggestionsChannel = client.channels.cache.get(
				config.logs.declinedSuggestions
			)!;

			if (
				!approvedSuggestionsChannel.isText() ||
				!declinedSuggestionsChannel.isText()
			)
				return;

			const approvedMessages = await approvedSuggestionsChannel.messages.fetch({
				limit: 25,
			});
			const declinedMessages = await declinedSuggestionsChannel.messages.fetch({
				limit: 25,
			});
			if (!approvedMessages.size) return;
			const toRespond: ApplicationCommandOptionChoice[] = [];
			switch (interaction.options.data[0].name) {
				case "accept":
					approvedMessages
						.filter((m) => m.author.bot && m.embeds[0].title!.split("#")[1].length > 0)
						.map((m) => m.embeds[0].title!.split("#")[1])
						.forEach((s) => {
							toRespond.push({
								name: s,
								value: s,
							});
						});

					if (!interaction.responded) await interaction.respond(toRespond);
					break;
				case "decline":
					declinedMessages
						.filter((m) => m.author.bot)
						.filter((m) => m.embeds[0].title!.split("#")[1].length > 0)
						.map((m) => m.embeds[0].title!.split("#")[1])
						.forEach((s) => {
							toRespond.push({
								name: s,
								value: s,
							});
						});

					if (!interaction.responded) await interaction.respond(toRespond);
					break;
				default:
					break;
			}
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	},
	undefined,
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
				],
			},
		],
	}
);
