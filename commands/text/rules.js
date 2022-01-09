"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const Command_1 = require("../../utils/Command");
const fs_1 = require("fs");
const path_1 = require("path");
const Logger_1 = require("../../utils/Logger");
exports.command = new Command_1.Command("rules", async (message) => {
    try {
        const rules = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, "..", "..", "..", "assets", "rules.txt")).toString();
        await message.channel.send({
            embeds: [
                {
                    title: "Rules",
                    description: rules,
                    color: 0x29abe2,
                },
            ],
        });
    }
    catch (err) {
        Logger_1.Logger.error(`${err.name}: ${err.message}`);
    }
}, {
    custom: (message) => {
        if (message.author.id !== "489031280147693568")
            return false;
        return true;
    },
});
//# sourceMappingURL=rules.js.map