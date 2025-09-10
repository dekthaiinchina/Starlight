import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext, Options, createStringOption } from "seyfert";

export const AutoPlayCommandOptions = {
	type: createStringOption({
		description: "[EN]: Skip the music | [TH]: ข้ามเพลง",
		required: true,
		choices: [
			{
				name: "Enable | เปิด",
				value: "true",
			},
			{
				name: "Disable | ปิด",
				value: "false",
			},
		] as const,
	}),
};

@Declare({
	name: "autoplay",
	description: "[EN]: AutoPlay the music | [TH]: เล่นเพลงอัตโนมัติ",
	contexts: ["Guild"],
})

@Options(AutoPlayCommandOptions)
export default class AutoPlayCommand extends Command {
	async run(ctx: CommandContext<typeof AutoPlayCommandOptions>) {
		try {
			const player = ctx.client.lithiumx.players.get(ctx.guildId);
			if (!player) {
				return ctx.editOrReply({
					content: "There is no player in this guild.",
				});
			} else {
				if (ctx.options.type) {
					player.setAutoplay(true, ctx.author);
					return ctx.editOrReply({
						content: "AutoPlay has been enabled.",
					});
				} else {
					player.setAutoplay(false, ctx.author);
					return ctx.editOrReply({
						content: "AutoPlay has been disabled.",
					});
				}
			}
		} catch (error) {
			return ErrorRequest(ctx, error as Error);
		}
	}
}
