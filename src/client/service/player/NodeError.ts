import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXNode } from "lithiumx";

const NodeError: PlayerExecute = {
	name: "NodeError",
	type: "player",
	execute(client: UsingClient, node: LithiumXNode, error: Error): Promise<void> {
		return Promise.resolve().then(() => client.logger.error(`Node ${node.options.identifier} error: ${error.message}`));
	},
};
export default NodeError;
