import { ActionRow, CommandContext, Embed, StringSelectMenu } from 'seyfert';
import { IDatabase } from '../../interfaces/IDatabase';
import { UsingClient } from 'seyfert';
import { ServiceExecute } from "@/client/structures/ServiceExecute";

const ClusterCommand: ServiceExecute = {
    name: "ClusterCommand",
    type: "commands",
    filePath: __filename,
    async execute(client: UsingClient, database: IDatabase, interaction: CommandContext) {
        try {
            const start = performance.now();
            const mainEmbed = new Embed()
                .setColor("#8e8aff")
                .setAuthor({
                    name: `${interaction.client.me?.username} Cluster Information ✨`,
                    iconUrl: interaction.client.me?.avatarURL() || undefined,
                })
                .addFields({
                    name: "Cluster Information",
                    value: "Select a page to view cluster information.",
                })
                .setFooter({
                    text: `Execution Time: ${Math.round(performance.now() - start)}ms`,
                });

            const clusterData = await interaction.client.worker.broadcastEval(async (c) => {
                try {
                    return {
                        shards: c.workerData.shards,
                        id: c.workerId,
                        guilds: (await c.cache.guilds.count()),
                        users: Array.from(await c.cache.guilds.values())
                            .reduce((acc, guild) => acc + (guild.memberCount || 0), 0),
                        memory: process.memoryUsage().heapUsed,
                        uptime: c.uptime,
                    }
                } catch (err) {
                    interaction.client.logger.error('Error Broadcasting:', err);
                    return 0;
                }
            }).then((data) => data) as Array<{
                shards: number[],
                id: number,
                guilds: number,
                users: number,
                memory: number,
                uptime: number
            }>;

            const maxClustersPerPage = 12;
            const totalPages = Math.ceil(clusterData.length / maxClustersPerPage) + 1;

            const createClusterEmbed = (page: number): Promise<Embed> => {
                const t_start = performance.now();
                if (page === 0) return Promise.resolve(mainEmbed);

                const start = (page - 1) * maxClustersPerPage;
                const end = Math.min(start + maxClustersPerPage, clusterData.length);
                const clusterInfo = clusterData.slice(start, end);

                const embed = new Embed()
                    .setColor("#8e8aff")
                    .setAuthor({
                        name: `${interaction.client.me?.username} Cluster Information ✨`,
                        iconUrl: interaction.client.me?.avatarURL() || undefined,
                    });

                clusterInfo.forEach((cluster) => {
                    embed.addFields({
                        name: `Cluster: ${cluster.id}`,
                        value: `\`\`\`autohotkey\nShards: ${cluster.shards.join(', ')} \nGuilds : ${cluster.guilds}\nUsers : ${cluster.users}\nMemory : ${interaction.client.FormatMemory(cluster.memory)}\nUptime: ${(interaction.client.FormatTime(cluster.uptime))} \`\`\``,
                        inline: true
                    });
                });
                embed.setFooter({
                    text: `Page ${page} / ${totalPages - 1} | Execution Time: ${Math.round(performance.now() - t_start)}ms`,
                });
                return Promise.resolve(embed);
            };
            const createSelectMenu = () => {
                const options = [{
                    label: "Main Page",
                    description: "View the main status page",
                    value: "0",
                }];

                options.push(...Array.from({ length: totalPages - 1 }, (_, i) => ({
                    label: `Page ${i + 1}`,
                    description: `View cluster information for page ${i + 1}`,
                    value: `${i + 1}`,
                })));

                return new ActionRow().addComponents(
                    new StringSelectMenu({
                        custom_id: 'clusterPage',
                        placeholder: 'Select a page',
                        options: options
                    })
                );
            };
            const initialClusterEmbed = await createClusterEmbed(0);
            const selectMenu = createSelectMenu();
            const message = await interaction.editResponse({
                embeds: [initialClusterEmbed],
                components: [selectMenu],
            });
            if (!message) return;
            const collector = message.createComponentCollector({
                timeout: 60000,
                filter: i => i.user.id === interaction.author.id
            });
            collector.run('clusterPage', async (interaction) => {
                if (!interaction.isStringSelectMenu()) return;
                try {
                    const selectedPage = parseInt(interaction.values[0]);
                    const updatedClusterEmbed = await createClusterEmbed(selectedPage);
                    await interaction.update({
                        embeds: [updatedClusterEmbed],
                        components: [selectMenu],
                    }).catch(() => { });
                } catch (error) {
                    interaction.client.logger.error(error);
                }
            });
        } catch (error) {
            interaction.client.logger.error(error);
            await interaction.editResponse({
                content: 'An error occurred while executing the command.',
                components: [],
            }).catch(() => { });
        }
    }
}

export default ClusterCommand;