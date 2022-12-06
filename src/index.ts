import { GatewayIntentBits } from "discord-api-types/v10";
import { Partials } from "discord.js";
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

await Promise.all([
	client.addEvents("events/normalEvents"),
	client.addComponentEvents("events/componentEvents"),
	client.addSlashCommands("commands/slash"),
	client.addCommands("commands/text"),
	client.connectMongoDatabase(),
	client.login(config.token),
]);
