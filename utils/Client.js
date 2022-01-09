"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const discord_js_1 = __importDefault(require("discord.js"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const config_1 = require("../config");
const Logger_1 = require("./Logger");
class Client extends discord_js_1.default.Client {
    constructor(options) {
        super(options);
        this.commands = [];
        this.componentEvents = [];
        this.slashCommands = [];
        this.prefix = options.prefix;
        this.restClient = new rest_1.REST({
            version: "9",
        }).setToken(config_1.config.token);
    }
    async addCommands(path) {
        const commandFiles = (0, node_fs_1.readdirSync)(path);
        for (const file of commandFiles) {
            // eslint-disable-next-line no-await-in-loop
            const { command } = (await Promise.resolve().then(() => __importStar(require((0, node_path_1.join)(path, file)))));
            this.commands.push(command);
        }
        return this;
    }
    async addComponentEvents(path) {
        const eventFiles = (0, node_fs_1.readdirSync)(path);
        for (const file of eventFiles) {
            // eslint-disable-next-line no-await-in-loop
            const { event } = (await Promise.resolve().then(() => __importStar(require((0, node_path_1.join)(path, file)))));
            this.componentEvents.push(event);
        }
        return this;
    }
    async addSlashCommands(path) {
        try {
            const commandFiles = (0, node_fs_1.readdirSync)(path);
            const commands = [];
            for (const file of commandFiles.filter((f) => f.endsWith(".js"))) {
                // eslint-disable-next-line no-await-in-loop
                const { command } = (await Promise.resolve().then(() => __importStar(require((0, node_path_1.join)(path, file)))));
                this.slashCommands.push(command);
                do
                    // eslint-disable-next-line no-await-in-loop
                    await this.wait(500);
                while (!this.user);
                commands.push({
                    type: command.type,
                    name: command.name,
                    description: command.description,
                    options: command.options?.options ?? undefined,
                });
                // eslint-disable-next-line no-await-in-loop
                await this.restClient?.put(v9_1.Routes.applicationGuildCommands(this.user.id, config_1.config.guildId), {
                    body: commands,
                });
            }
        }
        catch (error) {
            Logger_1.Logger.error(error.message);
        }
        return this;
    }
    async addEvents(path) {
        const eventFiles = (0, node_fs_1.readdirSync)(path);
        for (const file of eventFiles.filter((f) => f.endsWith(".js"))) {
            // eslint-disable-next-line no-await-in-loop
            const { event } = (await Promise.resolve().then(() => __importStar(require((0, node_path_1.join)(path, file)))));
            if (event.once ?? false)
                this.once(event.event, (...args) => {
                    void event.listener(this, ...args);
                });
            else
                this.on(event.event, (...args) => {
                    void event.listener(this, ...args);
                });
        }
        return this;
    }
    getPrefixesForMessage(message) {
        if (message.content.match(this.mentionPrefixRegExp())?.length != null)
            return [`<@!${this.user.id}>`];
        return [this.prefix];
    }
    hasCommand(message) {
        const matchResult = this.splitPrefixFromContent(message);
        if (!matchResult)
            return null;
        const [prefix, content] = matchResult;
        if (!content) {
            if (!prefix || !prefix.match(this.mentionPrefixRegExp()))
                return null;
            return [prefix, ""];
        }
        const args = content.split(" ").filter((arg) => arg !== "");
        const commandName = args.shift();
        if (commandName === undefined)
            return null;
        return [prefix, commandName.toLowerCase(), ...args];
    }
    mentionPrefixRegExp() {
        if (this.user)
            return new RegExp(`^<@!?${this.user.id}>\\s?`);
        return null;
    }
    async processCommand(message) {
        const commandInformation = this.hasCommand(message);
        if (!commandInformation)
            return false;
        const [_prefix, commandName, ...args] = commandInformation;
        const command = this.commands.find((c) => c.names.includes(commandName)) ?? null;
        if (!command)
            return false;
        await command.execute(message, args, this);
        return true;
    }
    async processSlashCommand(interaction) {
        const command = this.slashCommands.find((c) => c.name === interaction.commandName);
        if (!command)
            return false;
        await command.execute(interaction, this);
        return true;
    }
    splitPrefixFromContent(message) {
        const prefixes = this.getPrefixesForMessage(message);
        for (const prefix of prefixes)
            if (message.content.toLowerCase().startsWith(prefix.toLowerCase()))
                return [prefix, message.content.slice(prefix.length)];
        const match = message.content.match(this.mentionPrefixRegExp());
        if (match)
            return [match[0], message.content.slice(match[0].length)];
        if (!(message.channel instanceof discord_js_1.default.GuildChannel))
            return ["", message.content];
        return null;
    }
    async wait(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map