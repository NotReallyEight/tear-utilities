import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";

const roleIds = Object.values(config.roles.notificationRoles);

export const event = new ComponentEvent(
	"notification-roles-select",
	async (interaction) => {
		try {
			await interaction.deferUpdate();

			if (!interaction.isSelectMenu() || !interaction.inCachedGuild()) return;

			const newRoles = interaction.member.roles.cache
				.map((r) => r.id)
				.filter((r) => !roleIds.includes(r));

			if (interaction.values.length)
				interaction.values.forEach((v) => newRoles.push(v.split("-")[2]));

			await interaction.member.roles.set(newRoles);
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	}
);
