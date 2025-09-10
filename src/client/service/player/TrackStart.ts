import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXPlayer, Track } from "lithiumx";

export const TrackStart: PlayerExecute = {
	name: "TrackStart",
	type: "player",
	execute(client: UsingClient, player: LithiumXPlayer, track: Track): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Track ${track.title} started on ${player.guild} node: ${player.node.options.identifier}`));
	},
};

export default TrackStart;