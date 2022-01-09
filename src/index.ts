import Discord from "discord.js";
import express from "express";
import { join } from "node:path";
import { config } from "./config";
import { Client } from "./utils/Client";

// create a basic express server
const app = express();

app.use((_, res) => {
	res.redirect("https://notreallyeight.tk");
});

app.listen(3000);

const client = new Client({
	intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
	prefix: config.prefix,
	token: config.token!,
});

void client.addEvents(join(__dirname, "events"));

void client.addSlashCommands(join(__dirname, "commands", "slash"));

void client.login(config.token);
