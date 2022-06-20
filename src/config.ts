import dotenv from "dotenv";
import { env } from "node:process";

dotenv.config();

export const config = {
	commandsEmbedsColor: 0x29abe2,
	token: env.TOKEN!,
	prefix: "t!",
	guildId: "918576105345146951",
	roles: {
		colorRoles: {
			black: "931208760242892893",
			blue: "931210219420274768",
			blurple: "931210401113313290",
			green: "931210134280085544",
			orange: "931208480231129141",
			pink: "931209875613171742",
			purple: "931210352048369664",
			red: "931210018911584308",
			white: "931208670795145216",
		},
		notificationRoles: {
			announcement: "931505151922012210",
			chat: "988138194681884753",
			event: "931505232859500564",
			giveaway: "931505287981068298",
			poll: "931505332788817930",
		},
		pronounRoles: {
			he: "931497272015986729",
			she: "931497313111797791",
			they: "931497350621429791",
		},
		staffRole: "918800131623628810",
	},
	logs: {
		suggestions: "931589783740883015",
		approvedSuggestions: "931590305046724628",
		declinedSuggestions: "931590325644972052",
	},
	autoRoles: {
		member: "918850815773528074",
	},
	mongoDB: {
		connectionString: env.MONGODB_CONNECTION_STRING!,
	},
};

