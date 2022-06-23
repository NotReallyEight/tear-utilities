import { config } from "../../config";
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

		if (
			userDocument &&
			userDocument.level * userDocument.level * 200 < xpToAdd
		) {
			xpToAdd -= userDocument.level * userDocument.level * 200;
			void message.channel.send(
				`Congratulations <@${message.author.id}>! You have reached level ${
					userDocument.level + 1
				}!`
			);

			if (
				Object.keys(config.levelRoles).includes(
					(userDocument.level + 1).toString()
				)
			) {
				const role = await message.guild.roles.fetch(
					config.levelRoles[
						`${(userDocument.level + 1) as keyof typeof config.levelRoles}`
					]
				);

				if (role == null)
					Logger.error(`Could not find level role ${userDocument.level + 1}`);
				else void message.member?.roles.add(role);
			}
		}

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
	}
});

