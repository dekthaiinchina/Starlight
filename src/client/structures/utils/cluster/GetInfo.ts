export function GetInfo(): {
    debug: boolean;
    intents: number;
    path : string;
    shards: number[];
    token: string;
    workerId: number;
    workerProxy: boolean;
    totalShards: number;
    mode: 'custom' | 'threads' | 'clusters';
    resharding: boolean;
    totalWorkers: number;
    info: object;
    compress: boolean;
} {
    return {
        debug: String(process.env.SEYFERT_WORKER_DEBUG) === 'true',
		intents: Number(process.env.SEYFERT_WORKER_INTENTS),
		path: process.env.SEYFERT_WORKER_PATH,
		shards: JSON.parse(process.env.SEYFERT_WORKER_SHARDS) as number[],
		token: process.env.SEYFERT_WORKER_TOKEN,
		workerId: Number(process.env.SEYFERT_WORKER_WORKERID),
		workerProxy: String(process.env.SEYFERT_WORKER_WORKERPROXY) === 'true',
		totalShards: Number(process.env.SEYFERT_WORKER_TOTALSHARDS),
		mode: process.env.SEYFERT_WORKER_MODE as 'custom' | 'threads' | 'clusters',
		resharding: String(process.env.SEYFERT_WORKER_RESHARDING) === 'true',
		totalWorkers: Number(process.env.SEYFERT_WORKER_TOTALWORKERS),
		info: JSON.parse(process.env.SEYFERT_WORKER_INFO) as object,
		compress: String(process.env.SEYFERT_WORKER_COMPRESS) === 'true',
    }
}