import type Discord from "discord.js";
import type { Client } from "../utils/Client";

export interface EventListenerOptions {
	once?: boolean;
}

export class Event<K extends keyof Discord.ClientEvents>
	implements EventListenerOptions
{
	event: K;

	listener: (
		client: Client,
		...args: [...Discord.ClientEvents[K]]
	) => Discord.Awaitable<void>;

	once?: boolean;

	constructor(
		event: K,
		listener: (
			client: Client,
			...args: [...Discord.ClientEvents[K]]
		) => Discord.Awaitable<void>,
		{ once = false }: EventListenerOptions = {}
	) {
		this.event = event;
		this.listener = listener;
		this.once = once;
	}
}
