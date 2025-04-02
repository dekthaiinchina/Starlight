import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { LithiumXPlayer, Track } from "lithiumx";

interface TrackException {
    exception: {
        message: string;
        severity: string;
        cause: string;
    };
}

const TrackError: PlayerExecute = {
    name: "TrackError",
    type: "player",
    execute(client: UsingClient, player: LithiumXPlayer, track: Track, error: TrackException): Promise<void> {
        return Promise.resolve().then(() =>
            client.logger.error(`Track ${track.title} error on ${player.guild}: ${error.exception.message} node: ${player.node.options.identifier}`)
        );
    },
};

export default TrackError;