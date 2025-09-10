import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext, Options, createStringOption, createBooleanOption } from "seyfert";

export const FiltersCommandOptions = {
	filter: createStringOption({
		description: "[EN]: The filter you want to apply | [TH]: ตัวกรองที่คุณต้องการใช้",
		choices: [
			{ name: 'Bass Boost', value: 'bassboost' },
			{ name: 'Distortion', value: 'distort' },
			{ name: '8D', value: 'eightD' },
			{ name: 'Karaoke', value: 'karaoke' },
			{ name: 'Nightcore', value: 'nightcore' },
			{ name: 'Slow Motion', value: 'slowmo' },
			{ name: 'Soft', value: 'soft' },
			{ name: 'Treble Bass', value: 'trebleBass' },
			{ name: 'TV', value: 'tv' },
			{ name: 'Vaporwave', value: 'vaporwave' },
			{ name: 'Clear', value: 'clear' },
		],
		required: true,
	}),
	mode: createBooleanOption({
        description: "[EN]: Enable or disable the filter | [TH]: เปิดหรือปิดตัวกรอง",
        required: false,
    }),
};

@Declare({
	name: "filters",
	description: "[EN]: Apply a filter to the current song | [TH]: ใช้ตัวกรองกับเพลงปัจจุบัน",
	contexts: ["Guild"],
})

@Options(FiltersCommandOptions)
export default class PlayCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("FiltersCommmand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error as Error);
		}
	}
}
