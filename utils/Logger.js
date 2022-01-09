"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const tslib_1 = require("tslib");
const chalk_1 = (0, tslib_1.__importDefault)(require("chalk"));
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class Logger {
    static error(message) {
        console.log(chalk_1.default.bold.red("[ERROR] ") + message);
    }
    static info(message) {
        console.log(chalk_1.default.bold.green("[INFO]  ") + message);
    }
}
exports.Logger = Logger;
