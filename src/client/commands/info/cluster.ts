import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
    name: "cluster",
    description: "[EN]: Show the cluster information | [TH]: แสดงข้อมูลของคลัสเตอร์",
})

export default class ClusterCommand extends Command {
    async run(ctx: CommandContext) {
        try {
            return await ctx.client.services.execute("ClusterCommand", ctx);
        } catch (error) {
            return ErrorRequest(ctx, error as Error);
        }
    }
}
