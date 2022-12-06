import {
	ApplicationCommandOptionType,
	ApplicationCommandPermissionType,
	ApplicationCommandType,
} from "discord-api-types/v9";
import type { ApplicationCommandOptionChoiceData } from "discord.js";
import { ChannelType } from "discord.js";
import { config } from "../../config";
import { Logger } from "../../utils/Logger";
import { SlashCommand } from "../../utils/SlashCommand";

export const command = new SlashCommand(
	"suggestion",
	async (interaction, client) => {
		try {
			if (!interaction.inCachedGuild()) return;

			const suggestionsChannel = client.channels.cache.get(
				config.logs.suggestions
			)!;

			if (suggestionsChannel.type !== ChannelType.GuildText) return;

			await interaction.deferReply();

			const suggestionMessages = await suggestionsChannel.messages.fetch({
				limit: 100,
			});

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
				acceptedSuggestionsChannel.type !== ChannelType.GuildText ||
				declinedSuggestionsChannel.type !== ChannelType.GuildText
			)
				return;

			let content: string | null = "";

			if (
				!interaction.options.data[0].options ||
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				interaction.options.data[0].options[1] == null ||
				interaction.options.data[0].options[1].value == null
			)
				content = `**${
					interaction.options.data[0].name === "accept"
						? "Accepted"
						: "Declined"
				} by**: <@${interaction.member.id}>`;
			else
				content = `**Reason**: ${interaction.options.data[0].options[1].value.toString()}\n**${
					interaction.options.data[0].name === "accept"
						? "Accepted"
						: "Declined"
				} by**: <@${interaction.member.id}>`;
			const embeds = suggestionMessage.embeds.map((e) => e.toJSON());

			switch (interaction.options.data[0].name) {
				case "accept":
					embeds[0].title = `Suggestion Accepted #${
						embeds[0].title!.split("#")[1]
					}`;
					await acceptedSuggestionsChannel.send({
						content,
						embeds,
					});
					await interaction.editReply("Suggestion accepted.");
					break;
				case "decline":
					embeds[0].title = `Suggestion Declined #${
						embeds[0].title!.split("#")[1]
					}`;
					await declinedSuggestionsChannel.send({
						content,
						embeds,
					});
					await interaction.editReply("Suggestion declined.");
					break;
				default:
					break;
			}
		} catch (err) {
			Logger.error(err);
		}
	},
	async (interaction, client) => {
		try {
			if (!interaction.isAutocomplete()) return;

			const suggestionsChannel = client.channels.cache.get(
				config.logs.suggestions
			)!;

			if (suggestionsChannel.type !== ChannelType.GuildText) return;

			const suggestionsMessages = await suggestionsChannel.messages.fetch({
				limit: 100,
			});

			if (!suggestionsMessages.size) return;
			const toRespond: ApplicationCommandOptionChoiceData[] = [];
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
		} catch (err) {
			Logger.error(err);
		}
	},
	{
		custom: (interaction) =>
			interaction.inCachedGuild() &&
			interaction.member.roles.cache.has(config.roles.staffRole),
		permissions: [
			{
				id: config.roles.staffRole,
				type: ApplicationCommandPermissionType.Role,
				permission: true,
			},
		],
	},
	{
		description: "Accept or decline a suggestion.",
		type: ApplicationCommandType.ChatInput,
		defaultPermission: false,
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
