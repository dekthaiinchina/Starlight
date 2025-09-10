import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXNode } from "lithiumx";

const NodeCreate: PlayerExecute = {
	name: "NodeCreate",
	type: "player",
	execute(client: UsingClient, node: LithiumXNode): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Node ${node.options.identifier} created`));
	},
};
export default NodeCreate;