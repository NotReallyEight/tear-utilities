import type { APIEmbed } from "discord-api-types/v9";
import { ApplicationCommandType } from "discord-api-types/v9";
import { SlashCommand } from "../../utils/SlashCommand";
import { config } from "../../config";
import { Logger } from "../../utils/Logger";
import type { GuildTextBasedChannel } from "discord.js";

export const command = new SlashCommand(
	"suggest",
	async (interaction) => {
		try {
			if (!interaction.isCommand() || !interaction.inCachedGuild()) return;

			await interaction.deferReply({
				ephemeral: true,
			});
			const suggestionChannel = interaction.guild.channels.cache.get(
				config.logs.suggestions
			)!;

			if (suggestionChannel.isThread() || !suggestionChannel.isText()) return;

			const message = await suggestionChannel.messages.fetch("931837510408089622");

			const splitted = message.content.split(":");

			let lastSuggestionId: number;

			if (!splitted[1].length) {
				await message.edit(`${splitted[0]}:1`);
				lastSuggestionId = 1;
			} else {
				await message.edit(`${splitted[0]}:${parseInt(splitted[1]) + 1}`);
				lastSuggestionId = parseInt(splitted[1]) + 1;
			}

			const channel = interaction.guild.channels.cache.get(
				config.logs.suggestions
			) as GuildTextBasedChannel;

			const embed: APIEmbed = {
				title: `New Suggestion! #${lastSuggestionId}`,
				description: `${interaction.options.getString(
					"suggestion",
					true
				)}\n\n_Suggested by ${interaction.user.tag}_`,
				footer: {
					text: `Upvotes : 0 | Downvotes : 0`,
					icon_url: interaction.member.displayAvatarURL(),
				},
				color: config.commandsEmbedsColor,
			};

			const suggestionMessage = await channel.send({
				embeds: [embed],
			});

			await Promise.all(suggestionMessage.react("👍"), suggestionMessage.react("👎"));

			await interaction.editReply("Suggestion sent!");
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	},
	undefined,
	{
		custom: (interaction) => interaction.user.id === "489031280147693568",
	},
	{
		description: "Suggest a feature you would like to see in the server.",
		type: ApplicationCommandType.ChatInput,
		defaultPermission: true,
		options: [
			{
				description: "The feature you would like to suggest.",
				name: "suggestion",
				type: 3,
				required: true,
				autocomplete: false,
			},
		],
	}
);
