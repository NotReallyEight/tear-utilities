import dotenv from "dotenv";
import { env } from "node:process";

dotenv.config();

export const config = {
	commandsEmbedsColor: 0x29abe2,
	token: env.TOKEN,
	prefix: "t!",
	guildId: "918576105345146951",
};
