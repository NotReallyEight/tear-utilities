import { config } from "../../config";
import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";

const roleIds = Object.values(config.roles.colorRoles);

export const event = new ComponentEvent(
	"color-roles-select",
	async (interaction) => {
		try {
			if (!interaction.isStringSelectMenu() || !interaction.inCachedGuild())
				return;

			const newRoles = interaction.member.roles.cache
				.map((r) => r.id)
				.filter((r) => !roleIds.includes(r));

			if (interaction.values.length)
				newRoles.push(interaction.values[0].split("-")[2]);

			await interaction.reply({
				ephemeral: true,
				content: interaction.values.length
					? `Added <@&${interaction.values[0].split("-")[2]}> to your roles.`
					: "Removed all color roles.",
			});

			await interaction.member.roles.set(newRoles);
		} catch (err) {
			Logger.error(err);
		}
	}
);
