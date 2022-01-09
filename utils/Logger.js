"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
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
//# sourceMappingURL=Logger.js.map