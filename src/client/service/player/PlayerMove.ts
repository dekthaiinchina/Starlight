import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXPlayer } from "lithiumx";

const PlayerMove: PlayerExecute = {
	name: "PlayerMove",
	type: "player",
	async execute(client: UsingClient, player: LithiumXPlayer, oldChannel: string, newChannel: string) {
		return Promise.resolve().then(() => client.logger.info(`Player moved from ${oldChannel} to ${newChannel} on ${player.guild}`));
	},
};

export default PlayerMove;