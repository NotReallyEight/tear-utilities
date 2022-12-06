import { config } from "../../config";
import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";

const roleIds = Object.values(config.roles.notificationRoles);

export const event = new ComponentEvent(
	"notification-roles-select",
	async (interaction) => {
		try {
			if (!interaction.isStringSelectMenu() || !interaction.inCachedGuild())
				return;

			const newRoles = interaction.member.roles.cache
				.map((r) => r.id)
				.filter((r) => !roleIds.includes(r));
			const addedRoles: string[] = [];

			if (interaction.values.length)
				for (const v of interaction.values) {
					newRoles.push(v.split("-")[2]);
					addedRoles.push(`<@&${v.split("-")[2]}>`);
				}

			await interaction.reply({
				ephemeral: true,
				content: addedRoles.length
					? `Added ${addedRoles.join(", ")} to your roles.`
					: "Removed all notification roles.",
			});

			await interaction.member.roles.set(newRoles);
		} catch (err) {
			Logger.error(err);
		}
	}
);
