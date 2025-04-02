import { ClusterClient } from "./ClusterClient";

export class Worker {
    public constructor(
        public client: ClusterClient
    ) {
        this.client = client;
    }

    public Getinfo: typeof import("./GetInfo").GetInfo;
    public async broadcastEval<T>(
        script: (client: ClusterClient) => T
    ): Promise<Array<T>> {
        const results = [];
        for (let i = 0; i < this.client.workerData.totalWorkers; i++) {
            results.push(await this.client.tellWorker(
                i,
                (workerClient, { script }) => {
                    try {
                        return eval(`(${script})(workerClient)`) as T;
                    } catch (error) {
                        return { error: (error as Error).message };
                    }
                },
                { script: script.toString() }
            ));
        }
        return results as Array<T>;
    }
}