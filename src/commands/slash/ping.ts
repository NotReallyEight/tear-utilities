import { SlashCommand } from "../../utils/SlashCommand";

export const command = new SlashCommand(
	"ping",
	(interaction) => {
		void interaction.reply("Pong!");
	},
	undefined,
	undefined,
	{
		description: "Pong!",
		type: 1,
		defaultPermission: true,
	}
);
