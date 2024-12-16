import type { VoicePacket  } from "sakulink";
import { createEvent } from "seyfert";

export default createEvent({
	data: { once: false, name: "raw" },
	run(data, client) {
		return client.sakulink.updateVoiceState(data as VoicePacket);
	},
});
