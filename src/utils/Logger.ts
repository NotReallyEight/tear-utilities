import chalk from "chalk";
import { stderr, stdout } from "node:process";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Logger {
	static error(message: string): void {
		stderr.write(`${chalk.bold.red("[ERROR]")} ${message}\n`);
	}

	static info(message: string): void {
		stdout.write(`${chalk.bold.green("[INFO] ")} ${message}\n`);
	}
}
