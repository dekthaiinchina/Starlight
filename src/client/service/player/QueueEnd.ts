import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXPlayer } from "lithiumx";

const QueueEnd: PlayerExecute = {
	name: "QueueEnd",
	type: "player",
	execute(client: UsingClient, player: LithiumXPlayer): Promise<void> {
		return Promise.resolve(
			player.destroy()
		).then(() => {
			client.logger.info(`Queue ended on ${player.guild} node: ${player.node.options.identifier}`);
		});
	},
};

export default QueueEnd;