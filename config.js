"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const tslib_1 = require("tslib");
const dotenv_1 = (0, tslib_1.__importDefault)(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    token: process.env.TOKEN,
    prefix: "t!",
    guildId: "918576105345146951",
};
