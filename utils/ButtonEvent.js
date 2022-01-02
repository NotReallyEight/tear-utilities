"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ButtonEvent {
    constructor(name, fn, requirements) {
        this.name = name;
        this.fn = fn;
        this.requirements = {};
        if (requirements)
            if (requirements.custom)
                Object.defineProperty(this.requirements, "custom", {
                    value: requirements.custom,
                    writable: false,
                });
    }
    async checkPermissions(interaction, client) {
        return this._enoughRequirements(this.requirements, interaction, client);
    }
    async execute(interaction, client) {
        if (!(await this.checkPermissions(interaction, client)))
            return false;
        void this.fn(interaction, client);
        return true;
    }
    async _enoughRequirements(requirements, interaction, client) {
        const { custom } = requirements;
        if (custom && !(await custom(interaction, client)))
            return false;
        return true;
    }
}
exports.default = ButtonEvent;
