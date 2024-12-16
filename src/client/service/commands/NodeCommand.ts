import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext, UsingClient } from 'seyfert';
import { Node } from "sakulink";
import { stripIndent } from "common-tags";

const NodeCommand: ServiceExecute = {
	name: "NodeCommand",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext) {
		const nodeFields = client.sakulink.nodes.map((node: Node) => {
			const connectedStatus = node.connected ? `🟢` : `🔴`;
			const identifier = node.options.identifier;
			const players = node.stats.players || 0;
			const playingPlayers = node.stats.playingPlayers || 0;
			const cpuUsage = (node.stats.cpu.systemLoad * 100 + node.stats.cpu.lavalinkLoad * 100).toFixed(1) || 0.0;
			const ramUsage = client.FormatMemory(node.stats.memory.used) || 0.0;
			const ramMax = client.FormatMemory(node.stats.memory.reservable || 0.0);
			const uptime = client.FormatTime(node.stats.uptime || 0.0);

			return {
				name: `**\`${connectedStatus}\` ${identifier}**`,
				value: stripIndent`
					\`\`\`autohotkey
					Connected : ${players} Room
					Playing : ${playingPlayers} Room
					CPUUsge : ${cpuUsage} %
					RamUsge : ${ramUsage}
					RamMax : ${ramMax}
					Uptime : ${uptime}
					\`\`\``,
				inline: true,
			};
		});

		const description = `<:planet:1266771069604462672> **All nodes: [${client.sakulink.nodes.size}]**\n\`\`\`ml\nConnected : ${client.sakulink.nodes.reduce((a, b) => a + b.stats.players, 0)} Room\nPlaying : ${client.sakulink.nodes.reduce((a, b) => a + b.stats.playingPlayers, 0)} Room\n\`\`\``;

		await interaction.editOrReply({
			embeds: [
				{
					title: null,
					description: description,
					url: null,
					timestamp: new Date().toISOString(),
					color: 0x8e8aff,
					fields: nodeFields,
					thumbnail: null,
					image: null,
					author: {
						name: `${client.me.username} nodes information ✨`,
						url: undefined,
						icon_url: client.me.avatarURL(),
					},
				},
			],
		});
	},
};

export default NodeCommand;
