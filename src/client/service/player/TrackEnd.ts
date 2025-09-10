import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { LithiumXPlayer, Track } from "lithiumx";
import { UsingClient } from 'seyfert';

export const TrackEnd: PlayerExecute = {
    name: "TrackEnd",
    type: "player",
    execute(client: UsingClient, player: LithiumXPlayer, track: Track, reason: { reason: string }): Promise<void> {
        if (["STOPPED", "REPLACED"].includes(reason.reason)) return;
        if (player.trackRepeat || player.queueRepeat) return;
        if (!player.queue.current) return Promise.resolve(player.destroy()).then(() => null).catch(() => null);
        if (player.queue.length > 0) return;
        return Promise.resolve(
            player.destroy()
        ).then(() => client.logger.info(`Track "${track.title}" ended on guild "${player.guild}" with reason: ${reason.reason}`)).catch(() => null);
    },
};

export default TrackEnd;