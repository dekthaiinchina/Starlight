import { Logger } from "seyfert";
import c, { StyleFunction } from "ansi-colors";
import { LogLevels } from "seyfert/lib/common";
import { GetInfo } from "./cluster/GetInfo";

function formatMemoryUsage(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let i = 0;

	while (bytes >= 1024 && i < units.length - 1) {
		bytes /= 1024;
		i++;
	}

	let shardList = "0";
	try {
		const shardInfo = GetInfo();
		if (shardInfo && shardInfo.shards) shardList = shardInfo.shards.join(", ");
	} catch {
		return `[RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${bytes.toFixed(2)} ${units[i]}] [${shardList}]`;
	}
	return `[RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${bytes.toFixed(2)} ${units[i]}] [${shardList}]`;
}


function addPadding(label: string): string {
	const maxLength = 6;
	const bar = ">";
	const spacesToAdd = maxLength - label.length;
	if (spacesToAdd <= 0) return bar;
	const spaces = "".repeat(spacesToAdd);
	return spaces + bar;
}

export function customLogger(_this: Logger, level: LogLevels, args: unknown[]): unknown[] {
	const date: Date = new Date();
	const memory: NodeJS.MemoryUsage = process.memoryUsage();

	const label: string = Logger.prefixes.get(level) ?? "---";
	const timeFormat: string = `[${date.toLocaleDateString()} : ${date.toLocaleTimeString()}]`;

	const colors: Record<LogLevels, StyleFunction> = {
		[LogLevels.Debug]: c.grey,
		[LogLevels.Error]: c.red,
		[LogLevels.Info]: c.blue,
		[LogLevels.Warn]: c.yellow,
		[LogLevels.Fatal]: c.red,
	};
	const text = `${c.gray(`${timeFormat}`)} ${c.grey(formatMemoryUsage(memory.rss))} [${colors[level](label)}] ${addPadding(label)}`;
	return [text, ...args];
}