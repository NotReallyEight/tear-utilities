import Discord from "discord.js";
import { join } from "node:path";
import { config } from "./config";
import { Client } from "./utils/Client";

const client = new Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
	],
	prefix: config.prefix,
	token: config.token,
	partials: ["MESSAGE", "REACTION"],
});

client.addEvents(join(__dirname, "events", "normalEvents"));

client.addComponentEvents(join(__dirname, "events", "componentEvents"));

void client.addSlashCommands(join(__dirname, "commands", "slash"));

void client.addCommands(join(__dirname, "commands", "text"));

void client.connectMongoDatabase();

void client.login(config.token);
