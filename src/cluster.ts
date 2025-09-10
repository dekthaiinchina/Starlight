import "dotenv/config";
import { Logger } from "./lib/modules/Logger";
import { IWorkerManager } from "./client/structures/utils/cluster/IWorkerManager";
import { PresenceUpdateStatus } from "seyfert/lib/types";
import os from "os";

const log = new Logger("Cluster");
const manager = new IWorkerManager({
	mode: "clusters",
	path: `${__dirname}/client/index.js`,
	shardsPerWorker: 4,
	version: 10,
	properties: {
		browser: "",
		device: "",
		os: os.platform(),
	},
	presence(shardId, workerId) {
		return {
			status: PresenceUpdateStatus.Online,
			since: Date.now(),
			afk: false,
			activities: [
				{
					name: "with Lavalink!",
					state: `Cluster ${workerId} | Shard ${shardId}`,
					type: 1,
				},
			]
		};
	},
});

process.on("unhandledRejection", (reason, promise) => {
	(async () => {
		const result = await promise;
		log.error(`Unhandled Rejection at: ${JSON.stringify(result)} reason: ${JSON.stringify(reason)}`);
	})().catch((err: Error) => {
		log.error(`Error in unhandledRejection handler: ${err}`);
	});
});

process.on("uncaughtException", (err: Error) => {
	log.error(`Uncaught Exception: ${err.message}`);
});

process.on("uncaughtExceptionMonitor", (err: Error) => {
	log.error(`Uncaught Exception Monitor: ${err.message}`);
})

manager.on("Debug", (debug) => log.debug(debug));
manager.start().then(() => log.info("All clusters spawned")).catch((error) => console.error("Error spawning clusters:", error));