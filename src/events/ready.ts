import { Event } from "../utils/Event";
import { Logger } from "../utils/Logger";

export const event = new Event("ready", () => {
	Logger.info("The client is ready.");
});
