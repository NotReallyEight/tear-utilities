import { config } from "../../config";
import { Event } from "../../utils/Event";
import { Logger } from "../../utils/Logger";

export const event = new Event("guildMemberAdd", async (_client, member) => {
	const role = await member.guild.roles.fetch(config.autoRoles.member);

	if (role == null) {
		Logger.error(`Could not find role ${config.autoRoles.member}`);
		return;
	}

	void member.roles.add(role);
});

