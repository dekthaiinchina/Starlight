import { UpdateStatus } from "@/client/structures/utils/Client";
import { createEvent } from "seyfert";

export default createEvent({
    data: { once: true, name: "botReady" },
    async run(user, client) {
        const users = () => {
            let totalMembers = 0;
            for (const guild of client.cache.guilds.values().filter((g) => g.memberCount)) {
                totalMembers += guild.memberCount;
            }
            return totalMembers;
        }
        client.logger.info(`${user.username} is ready ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB | Guild: ${client.cache.guilds.count()} | User: ${users()}`);
        //client.logger.info(`[System] Language Data: ${JSON.stringify(client.langs.values)}`);
        await client.analytics.init();
        UpdateStatus(client);
        Array.from(client.cache.guilds.values()).forEach(async (guild) => {
            const guildData = await client.prisma.guild.findFirst({
                where: { id: guild.id },
            })
            if (!guildData) {
                setTimeout(async () => {
                    await Promise.all([
                        client.prisma.guild.create({
                            data: {
                                id: guild.id,
                                lang: "en",
                                name: guild.name,
                                room: { create: { id: "" } },
                                ai: { create: { name: "", channel: "" } },
                            },
                            select: {
                                uuid: true,
                                roomid: true,
                                id: true,
                                lang: true,
                                name: true,
                                room: { select: { id: true, message: true } },
                                ai: { select: { name: true, channel: true } },
                            },
                        }).then((db) => {
                            client.redis.set(`guild:${client.me.id}:${guild.id}`, JSON.stringify(db));
                            client.logger.info(`[System] Created new guild ${guild.name} (${guild.id})`);
                        }).catch((err) => {
                            client.logger.error(`[System] Error creating guild ${guild.name} (${guild.id})`, err);
                        })
                    ])
                }, 1000 * 2);
            } else {
                client.redis.set(`guild:${client.me.id}:${guild.id}`, JSON.stringify(guildData));
                client.logger.info(`[System] Loaded guild ${guild.name} (${guild.id})`);
            }
        })
    },
});
