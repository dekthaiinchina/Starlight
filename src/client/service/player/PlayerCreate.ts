import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXPlayer } from "lithiumx";

const PlayerCreate: PlayerExecute = {
	name: "PlayerCreate",
	type: "player",
	execute(client: UsingClient, player: LithiumXPlayer): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Player created on ${player.guild} node: ${player.node.options.identifier}`));
	},
};

export default PlayerCreate;
