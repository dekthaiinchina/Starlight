import type { VoicePacket } from "lithiumx";
import { createEvent } from "seyfert";

export default createEvent({
	data: { once: false, name: "raw" },
	run(data, client) {
		return client.lithiumx.updateVoiceState(data as VoicePacket);
	},
});
