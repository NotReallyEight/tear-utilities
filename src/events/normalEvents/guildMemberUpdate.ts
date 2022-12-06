import { config } from "../../config";
import { Event } from "../../utils/Event";
import { Logger } from "../../utils/Logger";

export const event = new Event(
	"guildMemberUpdate",
	async (_client, oldMember, newMember) => {
		if (oldMember.pending === newMember.pending) return;
		const role = await newMember.guild.roles.fetch(config.autoRoles.member);

		if (role == null) {
			Logger.error(`Could not find role ${config.autoRoles.member}`);
			return;
		}
		void newMember.roles.add(role);
	}
);
