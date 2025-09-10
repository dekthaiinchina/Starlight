import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXNode } from "lithiumx";

const NodeDestroy: PlayerExecute = {
	name: "NodeDestroy",
	type: "player",
	execute(client: UsingClient, node: LithiumXNode): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Node ${node.options.identifier} destroyed`));
	},
};
export default NodeDestroy;