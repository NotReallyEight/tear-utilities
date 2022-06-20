import type { LevelSchema } from "../../schemas";
import { Event } from "../../utils/Event";
import { Logger } from "../../utils/Logger";

export const event = new Event("messageCreate", async (client, message) => {
	try {
		if (
			message.author.bot ||
			!message.guild ||
			message.content.startsWith(client.prefix)
		)
			return;

		const levelDate = client.levelDates.get(message.author.id);

		if (
			levelDate &&
			message.createdAt.getTime() - levelDate.getTime() < 1000 * 60
		)
			return;

		client.levelDates.set(message.author.id, message.createdAt);

		await client.mongoClient.connect();

		const database = client.mongoClient.db("tear-utilities");
		const collection = database.collection<LevelSchema>("levels");

		const userDocument = await collection.findOne({
			userId: message.author.id,
		});

		let xpToAdd = (userDocument?.xp ?? 0) + (userDocument?.level ?? 1) * 5;
		const levelToAdd =
			userDocument && userDocument.level * userDocument.level * 200 < xpToAdd
				? userDocument.level + 1
				: userDocument?.level ?? 1;

		if (userDocument && userDocument.level * userDocument.level * 200 < xpToAdd)
			xpToAdd -= userDocument.level * userDocument.level * 200;

		await collection.findOneAndUpdate(
			{
				userId: message.author.id,
			},
			{
				$set: {
					xp: xpToAdd,
					level: levelToAdd,
				},
			},
			{
				upsert: true,
			}
		);
	} catch (err) {
		Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
	} finally {
		void client.mongoClient.close();
	}
});

