import { __InternalParseLocale, BaseChannel, CategoryChannel, CommandContext, DefaultLocale, DMChannel, UsingClient, VoiceState } from 'seyfert';
import { PlayCommandOptions } from "@/client/commands/music/play";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { ServiceExecute } from "@/client/structures/ServiceExecute";
import config from '@/config';
import { Node, Player, SearchResult } from 'sakulink';
import { ChannelType } from 'seyfert/lib/types';

type Voice = BaseChannel<ChannelType> | DMChannel | CategoryChannel;

const MusicPlay: ServiceExecute = {
	name: "MusicPlay",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof PlayCommandOptions>): Promise<void> {
		const { guildId, channelId, member } = interaction;
		const t = client.t(database.lang);
		const query = interaction.options["search"];
		let node = interaction.options["node"];
		const voice = await client.cache.voiceStates?.get(member.id, guildId)?.channel();
		if (!isValidVoiceChannel(voice, interaction, t)) return;
		const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
		const selectedNode = client.sakulink.nodes.get(node);
		node = getNode(client, selectedNode, node);
		let player = client.sakulink.players.get(interaction.guildId);
		if (!isSameVoiceChannel(bot, voice, interaction, t)) return;
		player = getPlayer(client, player, interaction, voice, channelId, node);
		const res = await client.sakulink.search({ query: query, source: "youtube" });
		await handleSearchResult(client, player, res, interaction, t, query);
	},
};

function isValidVoiceChannel(voice: Voice, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>): boolean {
	if (!voice?.is(["GuildVoice", "GuildStageVoice"])) {
		interaction.editOrReply({
			embeds: [
				{
					color: 0xff0000,
					description: t.play.not_join_voice_channel.get(),
				},
			],
		}).then().catch(console.error);
		return false;
	}
	return true;
}

function getNode(client: UsingClient, selectedNode: Node, node: string): string {
	if (!selectedNode || selectedNode.socket?.readyState !== WebSocket.OPEN) {
		node = client.sakulink.nodes.filter(n => n.socket?.readyState === WebSocket.OPEN).random().options.identifier;
	}
	return node;
}

function isSameVoiceChannel(bot: VoiceState, voice: Voice, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>): boolean {
	if (bot && bot.channelId !== voice.id) {
		interaction.editOrReply({
			embeds: [
				{
					color: 0xff0000,
					description: t.play.not_same_voice_channel.get(),
				},
			],
		}).then().catch(console.error);
		return false;
	}
	return true;
}

function getPlayer(client: UsingClient, player: Player, interaction: CommandContext<typeof PlayCommandOptions>, voice: Voice, channelId: string, node: string): Player {
	if (!player) {
		player = client.sakulink.create({
			guild: interaction.guildId,
			selfDeafen: true,
			selfMute: false,
			voiceChannel: voice.id,
			textChannel: channelId,
			node: node,
		});
	}

	if (player.state !== "CONNECTED") player.connect();
	return player;
}

async function handleSearchResult(client: UsingClient, player: Player, res: SearchResult, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>, query: string): Promise<void> {
	switch (res.loadType) {
		case "error":
			await handleError(player, res, interaction, client);
			break;
		case "empty":
			await handleEmpty(player, interaction, t, query);
			break;
		case "playlist":
			await handlePlaylist(player, res, interaction, t, client);
			break;
		case "track":
			await handleTrack(player, res, interaction, t, client);
			break;
		case "search":
			await handleSearch(player, res, interaction, t, client);
			break;
		default:
			if (!player.queue.current || !player) player.destroy();
			break;
	}
}

async function handleError(player: Player, res: SearchResult, interaction: CommandContext<typeof PlayCommandOptions>, client: UsingClient): Promise<void> {
	if (!player || !player.queue.current) player.destroy();
	await interaction.editOrReply({
		embeds: [
			{
				color: 0xff0000,
				author: {
					name: `Error Node: ${player.node.options.identifier}`,
					icon_url: client.me.avatarURL(),
				},
				description: `\`\`\`json\n${JSON.stringify(res, null, "  ")}\`\`\``,
			},
		],
	});
}

async function handleEmpty(player: Player, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>, query: string): Promise<void> {
	if (!player || !player.queue.current) player.destroy();
	const emptyEmbedJson = {
		color: 0xff0000,
		description: `\`\`\`${t.play.search_404.get()} ${query}\`\`\``,
	};
	await interaction.editOrReply({
		embeds: [emptyEmbedJson],
	});
}

async function handlePlaylist(player: Player, res: SearchResult, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>, client: UsingClient): Promise<void> {
	const playlist = res.playlist;
	await interaction.editOrReply({
		components: [config.config.ads_component || undefined],
		embeds: [
			{
				author: {
					name: `✅ | ${t.play.track_author_name.get()}`,
					icon_url: client.me.avatarURL(),
				},
				title: `\`\`🟢\`\` ${t.play.added_playlist.get()}:  \`${playlist.name}\``,
				color: 0xa861ff,
				image: {
					url: config.config.ads_image,
				},
				fields: [
					{
						name: t.play.request.get(),
						value: `<@!${interaction.author.id}>`,
						inline: true,
					},
					{
						name: t.play.time.get(),
						value: client.FormatTime(playlist.duration),
						inline: true,
					},
					{
						name: "Sponsor",
						value: config.config.ads_text,
						inline: false,
					},
				],
				footer: {
					text: `Node: ${player.node.options.identifier}`,
					icon_url: client.me.avatarURL(),
				},
				timestamp: new Date().toISOString(),
			},
		],
	});
	if (!player.queue || !player.queue.current) {
		player.queue.add(res.playlist.tracks);
		await player.play();
	} else {
		player.queue.add(res.playlist.tracks);
	}
	if (!player.playing) await player.play();
}

async function handleTrack(player: Player, res: SearchResult, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>, client: UsingClient): Promise<void> {
	const track = res.tracks[0];
	await interaction.editOrReply({
		components: [config.config.ads_component || undefined],
		embeds: [
			{
				author: {
					name: `✅ | ${t.play.track_author_name.get()}`,
					icon_url: client.me.avatarURL(),
				},
				title: `\`\`🟢\`\` ${t.play.added_song.get()}:  \`${track.title}\``,
				color: 0xa861ff,
				image: {
					url: config.config.ads_image,
				},
				fields: [
					{
						name: t.play.request.get(),
						value: `<@!${interaction.author.id}>`,
						inline: true,
					},
					{
						name: t.play.time.get(),
						value: track.isStream ? "🔴 LIVE STREAM" : client.FormatTime(track.duration),
						inline: true,
					},
					{
						name: "Sponsor",
						value: config.config.ads_text,
						inline: false,
					},
				],
				footer: {
					text: `Node: ${player.node.options.identifier}`,
					icon_url: client.me.avatarURL(),
				},
				timestamp: new Date().toISOString(),
			},
		],
	});
	if (!player.queue || !player.queue.current) {
		player.queue.add(track);
		await player.play();
	} else {
		player.queue.add(track);
	}
}

async function handleSearch(player: Player, res: SearchResult, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>, client: UsingClient): Promise<void> {
	if (!res.tracks || !res.tracks.length) {
		console.error("No tracks found in response:", res);
		await interaction.editOrReply({ content: "No tracks were found." });
		return;
	}
	const track = res.tracks[0];
	if (!track || !track.title || !track.displayThumbnail) {
		console.error("Track or its properties are missing:", track);
		await interaction.editOrReply({ content: "Track information is missing." });
		return;
	}

	player.queue.add(track);

	await interaction.editOrReply({
		components: [config.config.ads_component || undefined],
		embeds: [
			{
				author: {
					name: `✅ | ${t.play.track_author_name.get()}`,
					icon_url: client.me.avatarURL(),
				},
				title: `\`\`🟢\`\` ${t.play.added_song.get()}:  \`${track.title}\``,
				color: 0xa861ff,
				image: {
					url: config.config.ads_image,
				},
				fields: [
					{
						name: t.play.request.get(),
						value: `<@!${interaction.author.id}>`,
						inline: true,
					},
					{
						name: t.play.time.get(),
						value: track.isStream ? "🔴 LIVE STREAM" : client.FormatTime(track.duration),
						inline: true,
					},
					{
						name: "Sponsor",
						value: config.config.ads_text,
						inline: false,
					},
				],
				footer: {
					text: `Node: ${player.node.options.identifier}`,
					icon_url: client.me.avatarURL(),
				},
				timestamp: new Date().toISOString(),
			},
		],
	});
	if (!player.queue || !player.queue.current || !player.playing) {
		await player.play();
	}
}

export default MusicPlay;
