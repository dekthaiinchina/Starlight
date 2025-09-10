import { Bot } from "@/client/structures/Client";
import { ApiEndpoints, ApplicationCommandType, DiscordAnalyticsOptions, ErrorCodes, InteractionData, InteractionType, Locale, TrackGuildType } from "./utils/types";
import { Guild, Interaction, ModalSubmitInteraction } from "seyfert";

export default class DiscordAnalytics {
    private readonly _client: Bot;
    private readonly _apiToken: string;
    private readonly _sharded: boolean = false;
    private readonly _debug: boolean = true
    private readonly _headers: { 'Content-Type': string; Authorization: string; };
    private _isReady: boolean

    constructor(options: DiscordAnalyticsOptions) {
        this._client = options.client;
        this._apiToken = options.apiToken;
        this._headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${this._apiToken}`
        }
        this._sharded = options.sharded || false;
        this._isReady = false
        this._debug = options.debug || false
    }

    /**
     * Initialize DiscordAnalytics on your bot
     * /!\ Advanced users only
     * /!\ Required to use DiscordAnalytics (except if you use the trackEvents function)
     * /!\ Must be used when the client is ready (recommended to use in ready event to prevent problems)
     */
    public async init() {
        fetch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(':id', this._client.me.id)}`, {
            headers: this._headers,
            body: JSON.stringify({
                username: this._client.me.username,
                avatar: this._client.me.avatar,
                framework: "discord.js",
                version: '2.5.0',
                team: (await this._client.applications.fetch()).owner
                    ? (await this._client.applications.fetch()).owner.hasOwnProperty("members")
                        ? (await this._client.applications.fetch()).team.members.map((member: any) => member.user.id)
                        : [(await this._client.applications.fetch()).owner.id]
                    : [],
            }),
            method: "PATCH"
        }).then(async (res) => {
            if (res.status === 401) return console.error(ErrorCodes.INVALID_API_TOKEN)
            else if (res.status === 423) return console.error(ErrorCodes.SUSPENDED_BOT)
            else if (res.status !== 200) return console.error(ErrorCodes.INVALID_RESPONSE)

            if (this._debug) console.debug("[DISCORDANALYTICS] Instance successfully initialized")
            this._isReady = true

            if (this._debug) {
                if (process.argv[2] === "--dev") console.debug("[DISCORDANALYTICS] DevMode is enabled. Stats will be sent every 30s.")
                else console.debug("[DISCORDANALYTICS] DevMode is disabled. Stats will be sent every 5min.")
            }

            setInterval(async () => {
                if (this._debug) console.debug("[DISCORDANALYTICS] Sending stats...")

                // let guildCount = this._sharded ?
                //     ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.size))?.reduce((a: number, b: number) => a + b, 0) || 0) :
                //     this._client.guilds.cache.size;

                // let userCount = this._sharded ?
                //     ((await this._client.shard?.broadcastEval((c: any) => c.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0)))?.reduce((a: number, b: number) => a + b, 0) || 0) :
                //     this._client.guilds.cache.reduce((a: number, g: any) => a + (g.memberCount || 0), 0);
                let guildCount = this._sharded ?
                    ((await this._client.worker?.broadcastEval((c: Bot) => c.cache.guilds.count())) || 0) as number :
                    this._client.cache.guilds.count();
                let userCount = this._sharded ?
                    ((await this._client.worker?.broadcastEval((c: Bot) => {
                        let totalMembers = 0;
                        for (const guild of c.cache.guilds.values().filter((g) => g.memberCount)) {
                            totalMembers += guild.memberCount;
                        }
                        return totalMembers;
                    }
                    )) || 0) as number :
                    this._client.cache.guilds.values().reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
                fetch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_STATS_URL.replace(':id', this._client.me.id)}`, {
                    headers: this._headers,
                    body: JSON.stringify(this.statsData),
                    method: "POST"
                }).then(async (res) => {
                    if (res.status === 401) return console.error(ErrorCodes.INVALID_API_TOKEN)
                    else if (res.status === 423) return console.error(ErrorCodes.SUSPENDED_BOT)
                    else if (res.status !== 200) return console.error(ErrorCodes.INVALID_RESPONSE)
                    if (res.status === 200) {
                        if (this._debug) console.debug(`[DISCORDANALYTICS] Stats ${JSON.stringify(this.statsData)} sent to the API`)

                        this.statsData = {
                            date: new Date().toISOString().slice(0, 10),
                            guilds: guildCount,
                            users: userCount,
                            interactions: [],
                            locales: [],
                            guildsLocales: [],
                            guildMembers: await this.calculateGuildMembersRepartition(),
                            guildsStats: [],
                            addedGuilds: 0,
                            removedGuilds: 0,
                            users_type: {
                                admin: 0,
                                moderator: 0,
                                new_member: 0,
                                other: 0,
                                private_message: 0
                            }
                        }
                    }
                }).catch(e => {
                    if (this._debug) {
                        console.debug("[DISCORDANALYTICS] " + ErrorCodes.DATA_NOT_SENT);
                        console.error(e)
                    }
                });
            }, process.argv[2] === "--dev" ? 30000 : 5 * 60000);
        })
    }

    private statsData = {
        date: new Date().toISOString().slice(0, 10),
        guilds: 0,
        users: 0,
        interactions: [] as InteractionData[],
        locales: [] as { locale: Locale, number: number }[],
        guildsLocales: [] as { locale: Locale, number: number }[],
        guildMembers: {
            little: 0,
            medium: 0,
            big: 0,
            huge: 0
        },
        guildsStats: [] as { guildId: string, name: string, icon: string, members: number, interactions: number }[],
        addedGuilds: 0,
        removedGuilds: 0,
        users_type: {
            admin: 0,
            moderator: 0,
            new_member: 0,
            other: 0,
            private_message: 0
        }
    }

    private async calculateGuildMembersRepartition(): Promise<{ little: number, medium: number, big: number, huge: number }> {
        const res = {
            little: 0,
            medium: 0,
            big: 0,
            huge: 0
        }

        let guildsMembers: number[] = []

        if (!this._sharded) guildsMembers = this._client.cache.guilds.values().map((guild: Guild<"cached">) => guild.memberCount)
        else guildsMembers = [].concat(await this._client.worker?.broadcastEval((c: Bot) => c.cache.guilds.values().map((guild: any) => guild.memberCount)))

        for (const guild of guildsMembers) {
            if (guild <= 100) res.little++
            else if (guild > 100 && guild <= 500) res.medium++
            else if (guild > 500 && guild <= 1500) res.big++
            else if (guild > 1500) res.huge++
        }

        return res
    }

    /**
     * Track interactions
     * /!\ Advanced users only
     * /!\ You need to initialize the class first
     * @param interaction - BaseInteraction class and its extensions only
     * @param interactionNameResolver - A function that will resolve the name of the interaction
     */
    public async trackInteractions(interaction: Interaction, interactionNameResolver?: (interaction: Interaction) => string) {
        if (this._debug) console.log("[DISCORDANALYTICS] trackInteractions() triggered")
        if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED)

        let guilds: { locale: Locale, number: number }[] = []
        this._client.cache.guilds.values().map((current: Guild<"cached">) => guilds.find((x) => x.locale === current.preferredLocale) ?
            ++guilds.find((x) => x.locale === current.preferredLocale)!.number :
            guilds.push({ locale: current.preferredLocale as Locale, number: 1 }));

        this.statsData.guildsLocales = guilds

        this.statsData.locales.find((x) => x.locale === interaction.locale) ?
            ++this.statsData.locales.find((x) => x.locale === interaction.locale)!.number :
            this.statsData.locales.push({ locale: interaction.locale as Locale, number: 1 });

        if (interaction.isChatInput()) {
            const commandType = interaction.data.name ? interaction.data.type : ApplicationCommandType.ChatInputCommand;
            const commandName = interactionNameResolver ? interactionNameResolver(interaction) : interaction.data.name;
            this.statsData.interactions.find((x) => x.name === commandName && x.type === InteractionType.ApplicationCommand && x.command_type === commandType) ?
                ++this.statsData.interactions.find((x) => x.name === commandName && x.type === InteractionType.ApplicationCommand && x.command_type === commandType)!.number :
                this.statsData.interactions.push({ name: commandName, number: 1, type: InteractionType.ApplicationCommand, command_type: commandType  as ApplicationCommandType });
        }

        else if (interaction.isMessage() || interaction.isModal()) {
            const interactionName = interactionNameResolver ? interactionNameResolver(interaction) : (interaction as ModalSubmitInteraction).customId;
            const interactionType = interaction.isMessage() ? InteractionType.MessageComponent : InteractionType.ModalSubmit;

            this.statsData.interactions.find((x) => x.name === interactionName && x.type === interactionType) ?
                ++this.statsData.interactions.find((x) => x.name === interactionName && x.type === interactionType)!.number :
                this.statsData.interactions.push({ name: interactionName, number: 1, type: interactionType });
        }

        const guildData = this.statsData.guildsStats.find(guild => interaction.guild ? guild.guildId === interaction.guild.id : guild.guildId === "dm")
        if (guildData) this.statsData.guildsStats = this.statsData.guildsStats.filter(guild => guild.guildId !== guildData.guildId)
        this.statsData.guildsStats.push({
            guildId: interaction.guild ? interaction.guild.id : "dm",
            name: interaction.guild ? (await interaction.fetchGuild()).name : "DM",
            icon: interaction.guild && (await interaction.fetchGuild()).icon ? (await interaction.fetchGuild()).icon : undefined,
            interactions: guildData ? guildData.interactions + 1 : 1,
            members: interaction.guild ? (await interaction.fetchGuild()).memberCount : 0
        })

        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        if (!interaction.guild) ++this.statsData.users_type.private_message
        else if (interaction.member && interaction.member.permissions && interaction.member.permissions.has([8n]) || interaction.member.permissions.has([32n])) ++this.statsData.users_type.admin
        else if (interaction.member && interaction.member.permissions && interaction.member.permissions.has([8192n]) || interaction.member.permissions.has([2n]) || interaction.member.permissions.has([4n]) || interaction.member.permissions.has([4194304n]) || interaction.member.permissions.has([8388608n]) || interaction.member.permissions.has([16777216n]) || interaction.member.permissions.has([1099511627776n])) ++this.statsData.users_type.moderator
        else if (interaction.member && interaction.member.joinedAt && new Date(interaction.member.joinedAt) > oneWeekAgo) ++this.statsData.users_type.new_member
    }

    /**
     * Track guilds
     * /!\ Advanced users only
     * /!\ You need to initialize the class first
     * @param guild - The Guild instance only
     * @param {TrackGuildType} type - "create" if the event is guildCreate and "delete" if is guildDelete
     */
    public async trackGuilds(guild: any, type: TrackGuildType) {
        if (this._debug) console.log(`[DISCORDANALYTICS] trackGuilds(${type}) triggered`)
        if (type === "create") this.statsData.addedGuilds++
        else this.statsData.removedGuilds++
    }
}