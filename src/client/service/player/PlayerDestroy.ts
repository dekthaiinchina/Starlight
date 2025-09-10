import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXPlayer } from "lithiumx";

const PlayerDestroy: PlayerExecute = {
	name: "PlayerDestroy",
	type: "player",
	execute(client: UsingClient, player: LithiumXPlayer): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Player destroyed on ${player.guild} node: ${player.node.options.identifier}`));
	},
};

export default PlayerDestroy;