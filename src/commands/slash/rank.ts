import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord-api-types/v9";
import type { Canvas } from "canvas";
import { createCanvas, loadImage } from "canvas";
import { join } from "node:path";
import { SlashCommand } from "../../utils/SlashCommand";
import { Logger } from "../../utils/Logger";
import type { LevelSchema } from "../../schemas";

const adjustFontSize = (canvas: Canvas, text: string) => {
	let fontSize = 150;

	const ctx = canvas.getContext("2d");

	ctx.font = `regular ${fontSize}px JejuGothic`;

	do {
		fontSize -= 5;
		ctx.font = `regular ${fontSize}px JejuGothic`;
	} while (ctx.measureText(text).width > canvas.width - 2500);

	return fontSize;
};

const roundRect = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) => {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
};

export const command = new SlashCommand(
	"rank",
	async (interaction, client) => {
		try {
			await interaction.deferReply();

			await client.mongoClient.connect();
			const user = interaction.options.data[0]?.user ?? interaction.user;

			const db = client.mongoClient.db("tear-utilities");
			const collection = db.collection<LevelSchema>("levels");

			const levelInfo = await collection.findOne({
				userId: user.id,
			});

			if (!levelInfo) {
				void interaction.followUp(
					"The user does not have any rank information."
				);
				return;
			}

			const canvas = createCanvas(3840, 2160);
			const ctx = canvas.getContext("2d");
			const background = await loadImage(
				join(__dirname, "..", "..", "..", "assets", "rank-card-background.jpg")
			);
			const pfp = await loadImage(
				user.avatarURL({
					format: "png",
					size: 512,
				}) ??
					`https://cdn.discordapp.com/embed/avatars/${
						Number(user.discriminator) % 5
					}.png`
			);
			const xpToRankUp = levelInfo.level * levelInfo.level * 200;
			let formattedCurrentXpString = levelInfo.xp.toLocaleString();
			if (levelInfo.xp > 10_000) {
				const splittedNumbers = (levelInfo.xp / 1_000)
					.toLocaleString()
					.split(".");

				formattedCurrentXpString = `${splittedNumbers[0].toLocaleString()}${
					splittedNumbers[1] ? `.${splittedNumbers[1].slice(0, -1)}` : ".00"
				}K`;
			}

			let formattedXpToRankUpString = `${xpToRankUp}`;

			if (xpToRankUp > 10_000) {
				const splittedNumbers = (xpToRankUp / 1_000)
					.toLocaleString()
					.split(".");

				formattedXpToRankUpString = `${splittedNumbers[0].toLocaleString()}${
					splittedNumbers[1] ? `.${splittedNumbers[1].slice(0, -1)}` : ".00"
				}K`;
			}

			// Background image
			ctx.drawImage(background, 0, 0, 3840, 2160);

			// Rank Information Rectangle (Center)
			ctx.beginPath();
			ctx.globalAlpha = 0.25;
			ctx.rect(420, 480, 3000, 1200);
			ctx.fillStyle = "#E15454";
			roundRect(ctx, 420, 480, 3000, 1200, 30);
			ctx.fill();

			// Rank Information Bar (Full XP count)
			ctx.beginPath();
			ctx.rect(720, 1305, 2400, 150);
			ctx.fillStyle = "#8C8C8C";
			roundRect(ctx, 720, 1305, 2400, 150, 60);
			ctx.fill();

			// Rank Information Bar (Current XP count)
			ctx.beginPath();
			ctx.globalAlpha = 1;
			ctx.rect(720, 1305, 1050, 150);
			ctx.fillStyle = "#61D44E";
			roundRect(
				ctx,
				720,
				1305,
				Math.floor((levelInfo.xp * 2400) / xpToRankUp),
				150,
				60
			);
			ctx.fill();

			// Rank Information Text (Level)
			ctx.beginPath();
			ctx.fillStyle = "#A8A8A8";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = "bold 80px Inter";
			ctx.fillText("Level", 1088, 1132);
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText(
				`${levelInfo.level}`,
				ctx.measureText("Level").width + 1088,
				1132
			);
			ctx.fill();

			// Rank Information Text (XP)
			ctx.beginPath();
			ctx.fillStyle = "#A8A8A8";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = "bold 80px Inter";
			ctx.fillText(formattedCurrentXpString, 2385, 1132);
			ctx.fillStyle = "#FFFFFF";
			ctx.font = "regular 80px Inter";
			ctx.textAlign = "left";
			ctx.fillText(
				`/ ${formattedXpToRankUpString} XP`,
				ctx.measureText(formattedCurrentXpString).width + 2385,
				1132
			);
			ctx.fill();

			// Rank Information Image (PFP)
			ctx.save();
			ctx.beginPath();
			ctx.arc(1188, 789, 256, 0, Math.PI * 2, false);
			ctx.strokeStyle = "#E15454";
			ctx.stroke();
			ctx.clip();
			ctx.drawImage(pfp, 932, 533, 512, 512);
			ctx.restore();

			// Rank Information Text (Username)
			ctx.beginPath();
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = `regular ${adjustFontSize(
				canvas,
				`${user.username}#${user.discriminator}`
			)}px JejuGothic`;
			ctx.fillText(`${user.username}#${user.discriminator}`, 2500, 803);
			ctx.fill();

			const buffer = canvas.toBuffer("image/jpeg");

			await interaction.followUp({
				files: [buffer],
			});
		} catch (err) {
			console.log(err);
			Logger.error(`${(err as Error).name}: ${(err as Error).message}`);
		} finally {
			void client.mongoClient.close();
		}
	},
	undefined,
	undefined,
	{
		nameLocalizations: {
			"en-GB": "rank",
			"en-US": "rank",
			"es-ES": "nivel",
			"zh-CN": "等级",
			"zh-TW": "等級",
			"fr": "niveau",
			"it": "livello",
		},
		description: "See your rank or a user's rank.",
		descriptionLocalizations: {
			"en-GB": "See your rank or a user's rank.",
			"en-US": "See your rank or a user's rank.",
			"es-ES": "Comproba tu nivel o el nivel de un usuario.",
			"zh-CN": "查看你的等级或者一个用户的等级。",
			"zh-TW": "查看你的等級或者一個用戶的等級。",
			"fr": "Vois ton niveau ou le niveau d'un utilisateur.",
			"it": "Vedi il tuo livello o il livello di un utente.",
		},
		type: ApplicationCommandType.ChatInput,
		defaultPermission: true,
		options: [
			{
				description: "The user you want to check the rank for.",
				name: "user",
				type: ApplicationCommandOptionType.User,
				description_localizations: {
					"en-GB": "The user you want to check the rank for.",
					"en-US": "The user you want to check the rank for.",
					"es-ES": "El usuario para el que deseas comprobar el nivel.",
					"zh-CN": "你要查看的用户的等级。",
					"zh-TW": "你要查看的用戶的等級。",
					"fr": "L'utilisateur pour lequel vous souhaitez voir le niveau.",
					"it": "L'utente per cui vuoi vedere il livello.",
				},
			},
		],
	}
);

