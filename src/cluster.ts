import "dotenv/config";
import { Logger } from "./lib/modules/Logger";
import { IWorkerManager } from "./client/structures/utils/cluster/IWorkerManager";
import { PresenceUpdateStatus } from "seyfert/lib/types";
import os from "os";

const log = new Logger("Cluster");

const manager = new IWorkerManager({
	mode: "clusters",
	path: `${__dirname}/client/index.js`,
	shardsPerWorker: 5,
	workerProxy: true,
	version: 10,
	properties: {
		browser: "Starlight",
		device: "Starlight",
		os: os.platform(),
	},
	presence(shardId, workerId) {
		return {
			status: PresenceUpdateStatus.Online,
			since: Date.now(),
			afk: false,
			activities: [
				{
					name: "Starlight make by Anantix Network",
					state: `Cluster ${workerId} | Shard ${shardId}`,
					type: 0,
				},
			]
		};
	},
});

manager.on("ClusterCreate", (cluster) => {
	Array.from({ length: cluster.shardStart + cluster.totalShards - 1 }).forEach((shardId: number) => {
		log.info(`Shard ${shardId} spawned`);
		cluster.getShardInfo(shardId).then((info) => log.debug(`Shard ${shardId} | Cluster ${info.workerId} | Ready: ${info.open}`));
	});
});
manager.on("Debug", (debug) => log.debug(debug));
manager.start()
	.then(() => log.info("All clusters spawned"))
	.catch((error) => console.error("Error spawning clusters:", error));