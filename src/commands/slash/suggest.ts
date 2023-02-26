import type { APIEmbed } from "discord-api-types/v9";
import { ApplicationCommandType } from "discord-api-types/v9";
import type { GuildTextBasedChannel, StageChannel } from "discord.js";
import { ChannelType } from "discord.js";
import { config } from "../../config";
import { Logger } from "../../utils/Logger";
import { SlashCommand } from "../../utils/SlashCommand";

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

			if (
				suggestionChannel.isThread() ||
				suggestionChannel.type !== ChannelType.GuildText
			)
				return;

			const message = await suggestionChannel.messages.fetch(
				"931837510408089622"
			);

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
			) as Exclude<GuildTextBasedChannel, StageChannel>;

			const embed: Omit<APIEmbed, "type"> = {
				title: `New Suggestion! #${lastSuggestionId}`,
				description: `${interaction.options.getString("suggestion", true)}`,
				footer: {
					text: `Suggested by ${interaction.user.tag}`,
					icon_url: interaction.member.displayAvatarURL(),
				},
				color: config.commandsEmbedsColor,
			};

			const suggestionMessage = await channel.send({
				embeds: [embed],
			});

			await Promise.all([
				suggestionMessage.react("👍"),
				suggestionMessage.react("👎"),
			]);

			await interaction.editReply("Suggestion sent!");
		} catch (err) {
			Logger.error(err);
		}
	},
	undefined,
	undefined,
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

