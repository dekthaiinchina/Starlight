import { __InternalParseLocale, BaseChannel, CategoryChannel, CommandContext, DefaultLocale, DMChannel, UsingClient } from 'seyfert';
import { PlayCommandOptions } from "@/client/commands/music/play";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { ServiceExecute } from "@/client/structures/ServiceExecute";
import config from '@/config';
import { Player, SearchResult } from 'sonatica';
import { ChannelType } from 'seyfert/lib/types';

type Voice = BaseChannel<ChannelType> | DMChannel | CategoryChannel;

interface BotVoiceState {
    channelId: string;
}

const MusicPlay: ServiceExecute = {
    name: "MusicPlay",
    type: "commands",
    filePath: __filename,
    async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof PlayCommandOptions>): Promise<void> {
        const { guildId, channelId, member } = interaction;
        const t = client.t(database.lang);
        const query = interaction.options["search"];
        let node: string = interaction.options["node"];
        
        try {
            const voice = await client.cache.voiceStates?.get(member.id, guildId)?.channel();
            if (!isValidVoiceChannel(voice)) {
                await sendInvalidVoiceChannelMessage(interaction, t);
                return;
            }

            const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId) as BotVoiceState | undefined;
            if (!node) {
                node = client.sonatica.nodes.first().options.identifier;
            }

            let player = client.sonatica.players.get(interaction.guildId);
            if (!isSameVoiceChannel(bot, voice)) {
                await sendInvalidVoiceChannelMessage(interaction, t);
                return;
            }

            player = getPlayer(client, player, interaction, voice, channelId, node);
            const res = await client.sonatica.search({ query: query, source: "youtube" });
            await handleSearchResult(client, player, res, interaction, t, query);
        } catch (error: unknown) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
            const errorMessage = error instanceof Error ? error.message : String(error);
            try {
                await interaction.editOrReply({
                    content: `An error occurred: ${errorMessage}`,
                });
            } catch (err) {
                client.logger.error(`Failed to send error message: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    },
};

function isValidVoiceChannel(voice: Voice | null): boolean {
    return voice?.is(["GuildVoice", "GuildStageVoice"]) ?? false;
}

function isSameVoiceChannel(bot: BotVoiceState | undefined, voice: Voice): boolean {
    return !bot || bot.channelId === voice.id;
}

async function sendInvalidVoiceChannelMessage(interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>): Promise<void> {
    try {
        await interaction.editOrReply({
            embeds: [{
                color: 0xff0000,
                description: t.play.not_join_voice_channel.get(),
            }],
        });
    } catch (err) {
        interaction.client.logger.error(`Failed to send invalid voice channel message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

function getPlayer(client: UsingClient, player: Player | null, interaction: CommandContext<typeof PlayCommandOptions>, voice: Voice, channelId: string, node: string): Player {
    if (!player) {
        player = client.sonatica.create({
            guild: interaction.guildId,
            selfDeafen: true,
            selfMute: false,
            voiceChannel: voice.id,
            textChannel: channelId,
            node: node,
        });
    }

    if (player.state !== "CONNECTED") {
        try {
            player.connect();
        } catch (err) {
            client.logger.error(`Failed to connect player: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }
    return player;
}

async function handleSearchResult(
    client: UsingClient,
    player: Player,
    res: SearchResult,
    interaction: CommandContext<typeof PlayCommandOptions>,
    t: __InternalParseLocale<DefaultLocale>,
    query: string
): Promise<void> {
    try {
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
                if (!player.queue.current || !player) {
                    try {
                        await player.destroy();
                    } catch (err) {
                        client.logger.error(`Failed to destroy player: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    }
                }
                break;
        }
    } catch (err) {
        client.logger.error(`Failed to handle search result: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

async function handleError(player: Player, res: SearchResult, interaction: CommandContext<typeof PlayCommandOptions>, client: UsingClient): Promise<void> {
	if (!player || !player.queue.current) player.destroy().then().catch(console.error);
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
	}).then().catch(console.error);
}

async function handleEmpty(player: Player, interaction: CommandContext<typeof PlayCommandOptions>, t: __InternalParseLocale<DefaultLocale>, query: string): Promise<void> {
	if (!player || !player.queue.current) player.destroy().then().catch(console.error);
	const emptyEmbedJson = {
		color: 0xff0000,
		description: `\`\`\`${t.play.search_404.get()} ${query}\`\`\``,
	};
	await interaction.editOrReply({
		embeds: [emptyEmbedJson],
	}).then().catch(console.error);
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
	if (!track || !track.title || !track.thumbnail) {
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
