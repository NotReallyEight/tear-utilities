import chalk from "chalk";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Logger {
	static error(message: string): void {
		console.log(chalk.bold.red("[ERROR] ") + message);
	}

	static info(message: string): void {
		console.log(chalk.bold.green("[INFO]  ") + message);
	}
}
