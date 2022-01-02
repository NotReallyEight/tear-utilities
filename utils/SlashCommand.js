"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommand = void 0;
class SlashCommand {
    constructor(name, fn, requirements, options) {
        this.name = name;
        this.fn = fn;
        this.requirements = {};
        if (requirements)
            if (requirements.custom)
                this.requirements.custom = requirements.custom;
        if (options) {
            this.options = options;
            this.description = options.description;
            this.type = options.type;
        }
        else {
            this.description = "A command with no description!";
            this.type = 1 /* ChatInput */;
        }
    }
    async checkPermissions(interaction, client) {
        return this.enoughRequirements(this.requirements, interaction, client);
    }
    async execute(interaction, client) {
        if (!(await this.checkPermissions(interaction, client)))
            return false;
        void this.fn(interaction, client);
        return true;
    }
    async enoughRequirements(requirements, interaction, client) {
        const { custom } = requirements;
        if (custom && !(await custom(interaction, client)))
            return false;
        return true;
    }
}
exports.SlashCommand = SlashCommand;
