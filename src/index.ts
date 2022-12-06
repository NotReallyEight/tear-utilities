import { GatewayIntentBits } from "discord-api-types/v10";
import { Partials } from "discord.js";
import { join } from "node:path";
import { config } from "./config";
import { Client } from "./utils/Client";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
	],
	prefix: config.prefix,
	token: config.token,
	partials: [Partials.Message, Partials.Reaction],
});

client.addEvents(join(__dirname, "events", "normalEvents"));
client.addComponentEvents(join(__dirname, "events", "componentEvents"));
void client.addSlashCommands(join(__dirname, "commands", "slash"));
void client.addCommands(join(__dirname, "commands", "text"));
void client.connectMongoDatabase();
void client.login(config.token);
