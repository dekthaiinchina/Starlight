import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXNode } from "lithiumx";

const NodeConnect: PlayerExecute = {
	name: "NodeConnect",
	type: "player",
	async execute(client: UsingClient, node: LithiumXNode) {
		return Promise.resolve().then(() => client.logger.info(`Node ${node.options.identifier} connected`));
	},
};

export default NodeConnect;