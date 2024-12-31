import type { VoicePacket  } from "sonatica";
import { createEvent } from "seyfert";

export default createEvent({
	data: { once: false, name: "raw" },
	run(data, client) {
		return client.sonatica.updateVoiceState(data as VoicePacket);
	},
});
