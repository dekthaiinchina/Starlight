import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext, Embed, UsingClient } from "seyfert";
import { LoopCommandOptions } from "@/client/commands/music/loop";
import config from "@/config";

const LoopCommand: ServiceExecute = {
	name: "LoopCommand",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof LoopCommandOptions>): Promise<void> {
		try {
			const player = client.sonatica.players.get(interaction.guildId);
			if (!player) {
				interaction.editOrReply({
					embeds: [new Embed().setColor("Red").setDescription("There is no song currently playing.")],
				}).then().catch(console.error);
				return
			}
			const type = interaction.options.type;

			if (!type) {
				interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: "Please specify a loop type.",
						},
					],
				}).then().catch(console.error);
				return
			}
			switch (type) {
				case "song": {
					player.setRepeat(1);
					interaction.editOrReply({
						components: [config.config.ads_component],
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(`Song loop has been successfully turned on`)
								.setImage(config.config.ads_image)
								.addFields([
									{
										name: "Sponsor",
										value: config.config.ads_text,
										inline: false,
									},
								])
								.setTimestamp(),
						],
					}).then().catch(console.error);
					return
				}
				case "queue": {
					player.setRepeat(2);
					interaction.editOrReply({
						components: [config.config.ads_component],
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(`On Queue loop complete`)
								.setImage(config.config.ads_image)
								.addFields([
									{
										name: "Sponsor",
										value: config.config.ads_text,
										inline: false,
									},
								])
								.toJSON(),
						],
					}).then().catch(console.error);
					return
				}
				case "off": {
					player.setRepeat(0);
					interaction.editOrReply({
						components: [config.config.ads_component],
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(`Loop closed successfully.`)
								.setImage(config.config.ads_image)
								.addFields([
									{
										name: "Sponsor",
										value: config.config.ads_text,
										inline: false,
									},
								])
								.toJSON(),
						],
					}).then().catch(console.error);
					return
				}
			}
		} catch (err) {
			console.error(err);
			await interaction.editOrReply({ content: (err as Error).message }).then().catch(console.error);
			return;
		}
	},
};
export default LoopCommand;