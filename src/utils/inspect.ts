import { inspect as nodeInspect } from "node:util";

/**
 * Inspect any value.
 * @param value - The value to inspect
 * @returns A string representation of the value
 */
export const inspect = (value: unknown) => {
	switch (typeof value) {
		case "string":
			return value;
		case "bigint":
		case "number":
		case "boolean":
		case "function":
		case "symbol":
			return value.toString();
		case "object":
			return nodeInspect(value);
		default:
			return "undefined";
	}
};
