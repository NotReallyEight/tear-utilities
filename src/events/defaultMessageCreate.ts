import { Event } from "../utils/Event";
import { Logger } from "../utils/Logger";

export const event = new Event("messageCreate", async (client, message) => {
	try {
		if (message.author.bot) return;
		await client.processCommand(message);
	} catch (err: any) {
		Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
	}
});
