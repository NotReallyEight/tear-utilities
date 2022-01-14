import dotenv from "dotenv";
import { env } from "node:process";

dotenv.config();

export const config = {
	commandsEmbedsColor: 0x29abe2,
	token: env.TOKEN,
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
		pronounRoles: {
			he: "931497272015986729",
			she: "931497313111797791",
			they: "931497350621429791",
		},
	},
};
