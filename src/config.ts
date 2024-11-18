import { NodeOptions } from "sakulink";
import "dotenv/config";
import { ActionRow, BuilderComponents, Button } from "seyfert";

const config: { [key: string]: IConfig } = {
	development: {
		TOKEN: process.env.DEVELOPMENT_TOKEN,
		REDIS: process.env.DEVELOPMENT_REDIS,
		config: {
			ads_text: "กำลังมองหาเซิร์ฟเวอร์ Minecraft แนว PvP หรือ SMP อยู่ใช่ไหม?",
			ads_image: "https://cdn.faystarnext.studio/RinthongAds.png",
			ads_component: new ActionRow().addComponents(new Button().setLabel("Link").setStyle(5).setEmoji("🔗").setURL("https://discord.gg/gsHWw9XyE6"))
		},
		Lavalink: [
			{
				identifier: "Anantix [recommend]",
				host: "lavalink.anantix.network",
				password: "pg6|(}7fuD_:7d#QQq?9",
				port: 2335,
				playback: true,
				search: true,
				version: "v4",
			},
		],
	},
	production: {
		TOKEN: process.env.PRODUCTION_TOKEN,
		REDIS: process.env.PRODUCTION_REDIS,
		config: {
			ads_text: "กำลังมองหาเซิร์ฟเวอร์ Minecraft แนว PvP หรือ SMP อยู่ใช่ไหม?",
			ads_image: "https://cdn.faystarnext.studio/RinthongAds.png",
			ads_component: new ActionRow().addComponents(new Button().setLabel("Link").setStyle(5).setEmoji("🔗").setURL("https://discord.gg/gsHWw9XyE6"))
		},
		Lavalink: [
			{
				identifier: "Anantix [recommend]",
				host: "lavalink.anantix.network",
				password: "pg6|(}7fuD_:7d#QQq?9",
				port: 2335,
				playback: true,
				search: true,
				version: "v4",
			},
		],
	},
};
export default config[process.env.NODE_ENV || "development"];

interface IConfig {
	Lavalink: NodeOptions[];
	REDIS?: string;
	DSA?: string;
	TOKEN: string;
	config: {
		ads_text: string;
		ads_image: string;
		ads_component: ActionRow<BuilderComponents>;
	};
}
