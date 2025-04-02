import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXNode } from "lithiumx";

const NodeDisconnect: PlayerExecute = {
	name: "NodeDisconnect",
	type: "player",
	execute(client: UsingClient, node: LithiumXNode, reason: { reason: string }): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Node ${node.options.identifier} disconnected: ${reason.reason}`));
	},
};
export default NodeDisconnect;
