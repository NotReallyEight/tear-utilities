import { SlashCommand } from "../../utils/SlashCommand";

export const command = new SlashCommand("ping", (interaction) => {
	void interaction.reply("Pong!");
});
