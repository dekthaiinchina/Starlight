import { UpdateStatus } from "@/client/structures/utils/Client";
import { createEvent } from "seyfert";
import { ActivityType, PresenceUpdateStatus } from "seyfert/lib/types";

export default createEvent({
    data: { once: true, name: "botReady" },
    run(user, client) {
        const users = () => {
            let totalMembers = 0;
            for (const guild of client.cache.guilds.values().filter((g) => g.memberCount)) {
                totalMembers += guild.memberCount;
            }
            return totalMembers;
        }
        client.logger.info(`${user.username} is ready ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB | Guild: ${client.cache.guilds.count()} | User: ${users()}`);
        client.cluster.maintenance = false;
        client.sakulink.init(user.id);
        client.logger.info(`[System] Language Data: ${JSON.stringify(client.langs.values)}`);
        return UpdateStatus(client);
    },
});
