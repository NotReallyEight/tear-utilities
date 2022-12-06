import chalk from "chalk";
import { stderr, stdout } from "node:process";
import { inspect } from "./inspect";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Logger {
	static error(message: unknown): void {
		stderr.write(
			`${chalk.bold.red("[ERROR]")} ${inspect(
				typeof message === "string" ? new Error(message) : message
			)}\n`
		);
	}

	static info(message: unknown): void {
		stdout.write(`${chalk.bold.green("[INFO] ")} ${inspect(message)}\n`);
	}
}
