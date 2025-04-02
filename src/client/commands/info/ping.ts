import { Declare, Command, type CommandContext, Embed } from "seyfert";

@Declare({
	name: "ping",
	description: "Show the ping with discord",
})
export default class PingCommand extends Command {
	async run(ctx: CommandContext) {
		const start = performance.now();
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
                name: `${ctx.client.me?.username} Pong!`,
                iconUrl: ctx.client.me?.avatarURL(),
            })
            .addFields(
                {
                    name: `${PingStatus(ctx.client.latency)} Cluster [${ctx.client.workerId}]`,
                    value: `┗ ${ctx.client.latency}ms\n`
                }
            )
            .setFooter({
                text: `Requested by ${ctx.author.username} | Execution Time: ${Math.round(performance.now() - start)}ms`,
                iconUrl: ctx.author.avatarURL()
            })
        return ctx.editResponse({
            embeds: [embed]
        })
	}
}
