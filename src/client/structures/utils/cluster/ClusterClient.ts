import { Client, ClientOptions, WorkerClient } from "seyfert";
import { BaseClientOptions } from "seyfert/lib/client/base";
import { ManagerMessages, ShardManagerOptions } from "seyfert/lib/websocket";
import { Worker } from "./Worker";

interface WorkerClientOptions extends BaseClientOptions {
    commands?: NonNullable<Client['options']>['commands'];
    handlePayload?: ShardManagerOptions['handlePayload'];
    gateway?: ClientOptions['gateway'];
    postMessage?: (body: unknown) => unknown;
    /** can have performance issues in big bots if the client sends every event, especially in startup (false by default) */
    sendPayloadToParent?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleManagerMessages?(message: ManagerMessages): any;
}

class ClusterClient extends WorkerClient {
    public worker: Worker;
    public get uptime() {
        return process.uptime() * 1000;
    }
    public constructor(options?: WorkerClientOptions) {
        super(options);
        this.worker = new Worker(this);
    }
}

export { ClusterClient, WorkerClientOptions };