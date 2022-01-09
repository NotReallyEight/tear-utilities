"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const express_1 = __importDefault(require("express"));
const node_path_1 = require("node:path");
const config_1 = require("./config");
const Client_1 = require("./utils/Client");
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
void client.addEvents((0, node_path_1.join)(__dirname, "events"));
void client.addSlashCommands((0, node_path_1.join)(__dirname, "commands", "slash"));
void client.login(config_1.config.token);
//# sourceMappingURL=index.js.map