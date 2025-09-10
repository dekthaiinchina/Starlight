import { ActionRow, CommandContext, StringSelectMenu, SelectMenuInteraction, UsingClient, Message, Embed } from "seyfert";
import { IDatabase } from "@/client/interfaces/IDatabase";
import os from "os";
import { ServiceExecute } from "@/client/structures/ServiceExecute";

const Botinfo: ServiceExecute = {
    name: "BotinfoCommand",
    type: "commands",
    filePath: __filename,
    async execute(client: UsingClient, database: IDatabase, interaction: CommandContext) {
        try {
            const start = performance.now();
            const results = await Promise.all([
                interaction.client.worker.broadcastEval((c) => {
                    try {
                        return c.cache.guilds.count() || 0;
                    } catch (err) {
                        console.error('Error counting guilds:', err);
                        return 0;
                    }
                }),
                interaction.client.worker.broadcastEval(async (c) => {
                    try {
                        return Array.from(await c.cache.guilds.values())
                            .reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
                    } catch (err) {
                        console.error('Error counting members:', err);
                        return 0;
                    }
                }),
                interaction.client.worker.broadcastEval(() => {
                    try {
                        return process.memoryUsage().heapUsed / 1024 / 1024;
                    } catch (err) {
                        console.error('Error getting memory usage:', err);
                        return 0;
                    }
                }),
            ]);
            const totalGuilds = results[0].reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
            const totalUsers = results[1].reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
            const totalMemory = results[2].reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
            const clusterCount = interaction.client.workerData.shards.length + 1;
            const averageMemoryPerCluster = totalMemory / clusterCount;

            const embed = new Embed()
                .setTitle("Client Information")
                .setColor('Blurple')
                .setDescription(`┊ **ID:** \`${interaction.client.me?.id || 'Unknown'}\`
            ╰ **Username:** \`${interaction.client.me?.username || 'Unknown'}\`
            **Resources**:
            ┊ **CPU:** \`${os.cpus()[0].model}\`
            ┊ **Memory:** \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB\`
            ╰ **Avg Memory:** \`(${averageMemoryPerCluster.toFixed(2)} MB) | All Usage: ${totalMemory.toFixed(2)} MB\`
            **Size:**
            ┊ **Server(s):** \`${totalGuilds}\`
            ┊ **Member(s):** \`${totalUsers}\`
            ╰ **Ping:** \`${interaction.client.latency}ms\`
            **Data:**
            ┊ **API:** \`${(await import("../../../../package.json")).version}\`
            ┊ **Node.js:** \`${process.version}\`
            ┊ **LithiumX:** \`v${(await import("../../../../package.json")).dependencies.lithiumx}\`
            ╰ **Seyfert:** \`v${(await import("../../../../package.json")).dependencies.seyfert}\`
            `)
                .setFooter({
                    text: `Execution Time: ${Math.round(performance.now() - start)}ms`
                })

            interaction.editResponse({
                embeds: [embed]
            });
            return
        } catch (error) {
            console.error('Error in info command:', error);
            interaction.editResponse({
                content: 'An error occurred while fetching bot information.',
                embeds: []
            });
            return
        }
    },
};

export default Botinfo;
