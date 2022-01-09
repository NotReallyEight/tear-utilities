"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const node_process_1 = require("node:process");
dotenv_1.default.config();
exports.config = {
    token: node_process_1.env.TOKEN,
    prefix: "t!",
    guildId: "918576105345146951",
};
//# sourceMappingURL=config.js.map