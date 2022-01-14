import type { APIEmbed } from "discord-api-types/v9";
import { ApplicationCommandType } from "discord-api-types/v9";
import { SlashCommand } from "../../utils/SlashCommand";
import { config } from "../../config";
import { Logger } from "../../utils/Logger";
import type { GuildTextBasedChannel } from "discord.js";
import { MessageActionRow } from "discord.js";

export const command = new SlashCommand(
	"suggest",
	async (interaction) => {
		try {
			if (!interaction.isCommand() || !interaction.inCachedGuild()) return;

			await interaction.deferReply({
				ephemeral: true,
			});

			const channel = interaction.guild.channels.cache.get(
				config.logs.suggestions
			) as GuildTextBasedChannel;

			const embed: APIEmbed = {
				title: "New Suggestion!",
				description: interaction.options.getString("suggestion", true),
				footer: {
					text: `Suggested by ${interaction.member.user.tag}`,
					icon_url: interaction.member.displayAvatarURL(),
				},
				color: config.commandsEmbedsColor,
			};

			const row = new MessageActionRow().addComponents([
				{
					customId: "suggestion-accept",
					disabled: false,
					emoji: "✅",
					label: "Accept",
					style: "SUCCESS",
					type: "BUTTON",
				},
				{
					customId: "suggestion-decline",
					disabled: false,
					emoji: "❌",
					label: "Decline",
					style: "DANGER",
					type: "BUTTON",
				},
			]);
			await channel.send({
				embeds: [embed],
				components: [row],
			});

			await interaction.editReply("Suggestion sent!");
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	},
	{
		custom: (interaction) => {
			if (interaction.member?.user.id !== "489031280147693568") return false;
			return true;
		},
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
