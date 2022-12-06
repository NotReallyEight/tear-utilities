import type { Awaitable, ClientEvents } from "discord.js";
import type { Client } from "../utils/Client";

export type EventListenerOptions = {
	once?: boolean;
};

export class Event<K extends keyof ClientEvents>
	implements EventListenerOptions
{
	event: K;

	listener: (client: Client, ...args: [...ClientEvents[K]]) => Awaitable<void>;

	once?: boolean;

	constructor(
		event: K,
		listener: (
			client: Client,
			...args: [...ClientEvents[K]]
		) => Awaitable<void>,
		{ once = false }: EventListenerOptions = {}
	) {
		this.event = event;
		this.listener = listener;
		this.once = once;
	}
}
