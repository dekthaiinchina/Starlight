import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext, Options, createStringOption, AutocompleteInteraction } from "seyfert";

export const PlayCommandOptions = {
	search: createStringOption({
		description: "[EN]: The song you want to play | [TH]: เพลงที่คุณต้องการเล่น",
		required: true,
	}),
	node: createStringOption({
		description: "[EN]: The node you want to play the song | [TH]: โหนดที่คุณต้องการเล่นเพลง",
		required: false,
		autocomplete: async (interaction: AutocompleteInteraction) => {
			const nodes: {
				name: string;
				value: string;
			}[] = interaction.client.lithiumx.nodes.map((node) => ({
				name: `${node.options.identifier} - ${node.stats.players} Players`,
				value: node.options.identifier,
			}));
			return await interaction.respond(nodes).catch(() => { });
		},
	}),
};

@Declare({
	name: "play",
	description: "[EN]: Play a song | [TH]: เล่นเพลง",
	contexts: ["Guild"],
})

@Options(PlayCommandOptions)
export default class PlayCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("MusicPlay", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error as Error);
		}
	}
}
