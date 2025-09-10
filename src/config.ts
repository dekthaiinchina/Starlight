import { NodeOptions } from "lithiumx";
import "dotenv/config";

const config: { [key: string]: IConfig } = {
	development: {
		TOKEN: process.env.DEVELOPMENT_TOKEN,
		REDIS: process.env.DEVELOPMENT_REDIS,
		CLIENT_ID: process.env.CLIENT_ID,
		DSA: process.env.DSA,
		Lavalink: [
			{
				identifier: "LavalinkNode",
				host: "localhost",
				port: 2333,
				password: "youshallnotpass",
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
		CLIENT_ID: process.env.CLIENT_ID,
		DSA: process.env.DSA,
		Lavalink: [
			{
				identifier: "LavalinkNode",
				host: "localhost",
				port: 2333,
				password: "youshallnotpass",
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
	CLIENT_ID: string;
}
