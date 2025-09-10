import { Declare, Command, type CommandContext, Embed } from "seyfert";

@Declare({
    name: "ping",
    description: "Show the ping with discord",
})

export default class PingCommand extends Command {
    async run(ctx: CommandContext) {
        const start = performance.now();

        // Acknowledge the interaction to prevent timeout
        // Pass `false` directly, as per the error message's type expectation.
        await ctx.deferReply(false);

        function PingStatus(ping: number) {
            if (ping < 50) {
                return "🟢"
            } else if (ping < 100) {
                return "🟡"
            } else if (ping < 260) {
                return "🔴"
            } else {
                return "⚫"
            }
        }

        const embed: Embed = new Embed()
            .setAuthor({
                name: `${ctx.client.me?.username} API Latency`,
                iconUrl: ctx.client.me?.avatarURL(),
            })
            .addFields(
                {
                    name: `${PingStatus(ctx.client.latency)} Cluster [${ctx.client.workerId}]`,
                    value: `┗ ${ctx.client.latency}ms\n`
                }
            )
            .setFooter({
                text: `Requested by ${ctx.author.username}`,
                iconUrl: ctx.author.avatarURL()
            });

        // Edit the deferred reply with the final content
        const message = await ctx.editResponse({ embeds: [embed] });

        const end = performance.now();
        const executionTime = Math.round(end - start);

        const updatedEmbed = new Embed(embed.data)
            .setFooter({
                text: `${embed.data.footer?.text} | Execution Time: ${executionTime}ms`,
                iconUrl: embed.data.footer?.icon_url
            });

        return ctx.editResponse({ embeds: [updatedEmbed] });
    }
}
