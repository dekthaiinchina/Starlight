import { WorkerManager } from "seyfert";
import { TypedEmitter } from "tiny-typed-emitter";

interface IWorkerManagerEvents {
    ClusterCreate: (cluster: WorkerManager) => void;
    Debug: (debug: string) => void;
}

export class IWorkerManager extends TypedEmitter<IWorkerManagerEvents> {
    public manager: WorkerManager;

    public constructor(options: ConstructorParameters<typeof WorkerManager>[0]) {
        super();
        this.manager = new WorkerManager(options);
    }
    
    public async start(): Promise<void> {
        await this.manager.start().then(() => this.emit("ClusterCreate", this.manager)).catch((error: Error) => this.emit("Debug", `Error starting WorkerManager: ${error.message}`));
        this.emit("Debug", "WorkerManager started!");
        return
    }
}