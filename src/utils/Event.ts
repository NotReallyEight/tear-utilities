import type Discord from "discord.js";

export interface EventListenerOptions {
	once?: boolean;
}

export class Event<K extends keyof Discord.ClientEvents>
	implements EventListenerOptions
{
	args: [K, (...args: Discord.ClientEvents[K]) => Discord.Awaitable<void>];

	once?: boolean;

	computedListener?: (
		...args: Discord.ClientEvents[K]
	) => Discord.Awaitable<void>;

	constructor(
		event: K,
		listener: (...args: Discord.ClientEvents[K]) => Discord.Awaitable<void>,
		{ once = false }: EventListenerOptions = {}
	) {
		this.args = [event, listener];
		this.once = once;
	}
}
