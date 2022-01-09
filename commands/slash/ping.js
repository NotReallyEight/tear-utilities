"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const SlashCommand_1 = require("../../utils/SlashCommand");
exports.command = new SlashCommand_1.SlashCommand("ping", (interaction) => {
    void interaction.reply("Pong!");
}, undefined, {
    description: "Pong!",
    type: 1,
    defaultPermission: true,
});
