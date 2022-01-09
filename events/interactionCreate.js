"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const Event_1 = require("../utils/Event");
exports.event = new Event_1.Event("interactionCreate", (client, interaction) => {
    if (interaction.isCommand()) {
        if (client.slashCommands.find((c) => c.name === interaction.commandName))
            void client.processSlashCommand(interaction);
    }
    else if (interaction.isMessageComponent()) {
        const componentEvent = client.componentEvents.find((e) => e.name === interaction.customId);
        if (!componentEvent)
            return;
        void componentEvent.execute(interaction, client);
    }
});
