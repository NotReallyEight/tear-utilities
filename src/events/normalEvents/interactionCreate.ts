import { Event } from "../../utils/Event";

export const event = new Event("interactionCreate", (client, interaction) => {
	if (interaction.isAutocomplete())
		void client.processAutocompleteInteraction(interaction);

	if (interaction.isChatInputCommand()) {
		if (client.slashCommands.find((c) => c.name === interaction.commandName))
			void client.processSlashCommand(interaction);
	} else if (interaction.isMessageComponent()) {
		const componentEvent = client.componentEvents.find(
			(e) => e.name === interaction.customId
		);

		if (!componentEvent) return;

		void componentEvent.execute(interaction, client);
	}
});
