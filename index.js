"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Client_1 = require("./utils/Client");
const discord_js_1 = (0, tslib_1.__importDefault)(require("discord.js"));
const path_1 = require("path");
const config_1 = require("./config");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
// create a basic express server
const app = (0, express_1.default)();
app.use((_, res) => {
    res.redirect("https://notreallyeight.tk");
});
app.listen(3000);
const client = new Client_1.Client({
    intents: [discord_js_1.default.Intents.FLAGS.GUILDS, discord_js_1.default.Intents.FLAGS.GUILD_MESSAGES],
    prefix: config_1.config.prefix,
    token: config_1.config.token,
});
void client.addEvents((0, path_1.join)(__dirname, "events"));
void client.addSlashCommands((0, path_1.join)(__dirname, "commands", "slash"));
void client.login(config_1.config.token);
