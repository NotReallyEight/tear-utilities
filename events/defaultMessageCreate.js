"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const Event_1 = require("../utils/Event");
const Logger_1 = require("../utils/Logger");
exports.event = new Event_1.Event("messageCreate", async (client, message) => {
    try {
        if (message.author.bot)
            return;
        await client.processCommand(message);
    }
    catch (err) {
        Logger_1.Logger.error(`${err.name}: ${err.message}`);
    }
});
//# sourceMappingURL=defaultMessageCreate.js.map