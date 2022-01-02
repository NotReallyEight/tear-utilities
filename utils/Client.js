"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = (0, tslib_1.__importDefault)(require("discord.js"));
const fs_1 = require("fs");
const path_1 = require("path");
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
        const commandFiles = (0, fs_1.readdirSync)(path);
        for (const file of commandFiles) {
            // eslint-disable-next-line no-await-in-loop
            const { command } = (await Promise.resolve().then(() => (0, tslib_1.__importStar)(require((0, path_1.join)(path, file)))));
            this.commands.push(command);
        }
        return this;
    }
    async addSlashCommands(path) {
        try {
            const commandFiles = (0, fs_1.readdirSync)(path);
            const commands = [];
            for (const file of commandFiles) {
                // eslint-disable-next-line no-await-in-loop
                const { command } = (await Promise.resolve().then(() => (0, tslib_1.__importStar)(require((0, path_1.join)(path, file)))));
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
        const eventFiles = (0, fs_1.readdirSync)(path);
        for (const file of eventFiles) {
            // eslint-disable-next-line no-await-in-loop
            const { event } = (await Promise.resolve().then(() => (0, tslib_1.__importStar)(require((0, path_1.join)(path, file)))));
            event.computedListener = (...args) => {
                void event.args[1](...args);
            };
            if (event.once ?? false)
                this.once(event.args[0], event.computedListener);
            else
                this.on(event.args[0], event.computedListener);
        }
        return this;
    }
    getPrefixesForMessage() {
        const prefixes = [this.prefix];
        return prefixes;
    }
    mentionPrefixRegExp() {
        if (this.user)
            return new RegExp(`^<@!?${this.user.id}>\\s?`);
        return null;
    }
    splitPrefixFromContent(message) {
        const prefixes = this.getPrefixesForMessage();
        for (const prefix of prefixes)
            if (message.content.toLowerCase().startsWith(prefix.toLowerCase()))
                return [prefix, message.content.substr(prefix.length)];
        const match = message.content.match(this.mentionPrefixRegExp());
        if (match)
            return [match[0], message.content.substr(match[0].length)];
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
