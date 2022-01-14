import { ComponentEvent } from "../../utils/ComponentEvent";
import { Logger } from "../../utils/Logger";
import { config } from "../../config";

export const event = new ComponentEvent(
	"color-roles-select",
	async (interaction) => {
		try {
			await interaction.deferUpdate();
			const roleIds = Object.values(config.roles);
			if (!interaction.isSelectMenu() || !interaction.inCachedGuild()) return;
			const newRoles = interaction.member.roles.cache
				.map((r) => r.id)
				.filter((r) => !roleIds.includes(r));

			newRoles.push(interaction.values[0].split("-")[2]);

			await interaction.member.roles.set(newRoles);
		} catch (err: any) {
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		}
	}
);
