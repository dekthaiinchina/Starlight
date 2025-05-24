import { createEvent } from "seyfert";

export default createEvent({
	data: { once: false, name: "interactionCreate" },
	async run(interaction, client) {
        // @ts-ignore
        await client.analytics.trackInteractions(interaction);
		if (interaction.isChatInput()) {
            client.logger.info(`[Commands] ${interaction.user.username} (${interaction.user.id}) Command: ${interaction.data.name}`);
        }
        if (interaction.isAutocomplete()) {
            client.logger.info(`[AutoComplete] ${interaction.user.username} (${interaction.user.id}) Data: ${JSON.stringify((interaction.data.options[0] as { value: string }).value)}`);
        }
	},
});
