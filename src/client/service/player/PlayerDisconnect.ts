import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXPlayer } from "lithiumx";

export const PlayerDisconnect: PlayerExecute = {
	name: "PlayerDisconnect",
	type: "player",
	async execute(client: UsingClient, player: LithiumXPlayer, channel: string) {
		return Promise.resolve().then(() => client.logger.warn(`Player disconnected on ${player.guild} node: ${player.node.options.identifier} channel: ${channel}`));
	},
};

export default PlayerDisconnect;