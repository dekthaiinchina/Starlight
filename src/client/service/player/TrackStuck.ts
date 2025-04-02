import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Track, LithiumXPlayer } from "lithiumx";

export const TrackStuck: PlayerExecute = {
	name: "TrackStuck",
	type: "player",
	execute(client: UsingClient, track: Track, player: LithiumXPlayer, threshold: number): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Track ${track.title} stuck on ${player.guild} for ${threshold}ms`));
	},
};

export default TrackStuck;