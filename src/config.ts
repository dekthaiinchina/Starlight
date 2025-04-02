import { NodeOptions } from "lithiumx";
import "dotenv/config";
import { ActionRow, BuilderComponents, Button } from "seyfert";

const config: { [key: string]: IConfig } = {
	development: {
		TOKEN: process.env.DEVELOPMENT_TOKEN,
		REDIS: process.env.DEVELOPMENT_REDIS,
		config: {
			ads_text: "Anantix Cloud: บริการเปิด Minecraft Server และอื่นๆ อีกมากมาย!",
			ads_image: "https://r2.anantix.network/assets/img/packpterodactyl.png",
			ads_component: new ActionRow().addComponents(new Button().setLabel("Link").setStyle(5).setEmoji("🔗").setURL("https://discord.gg/anantix"))
		},
		Lavalink: [
			{
				identifier: "Anantix SG",
				host: "ipv4.digitalocean-sg.anantix.network",
				port: 2333,
				password: "A-SCARLET-ROSE-AMONG-THORNS-ENVIED-BY-ALL",
				secure: false,
				requestTimeout: 10000,
				retryDelay: 5000,
				retryAmount: Infinity,
			},
		],
	},
	production: {
		TOKEN: process.env.PRODUCTION_TOKEN,
		REDIS: process.env.PRODUCTION_REDIS,
		config: {
			ads_text: "Anantix Cloud: บริการเปิด Minecraft Server และอื่นๆ อีกมากมาย!",
			ads_image: "https://r2.anantix.network/assets/img/packpterodactyl.png",
			ads_component: new ActionRow().addComponents(new Button().setLabel("Link").setStyle(5).setEmoji("🔗").setURL("https://discord.gg/anantix"))
		},
		Lavalink: [
			{
				identifier: "Anantix SG",
				host: "ipv4.digitalocean-sg.anantix.network",
				port: 2333,
				password: "A-SCARLET-ROSE-AMONG-THORNS-ENVIED-BY-ALL",
				secure: false,
				requestTimeout: 10000,
				retryDelay: 5000,
				retryAmount: Infinity,
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
