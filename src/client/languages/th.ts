import type English from './en'

export default {
	lang: {
		already: "บอทใช้ภาษานี้อยู่แล้ว",
		success: "สำเร็จ",
		song: "เพลง",
	},
	music: {
		stop: "บอทหยุดเล่นเพลงแล้ว",
		volume: (value) => `เปลี่ยนระดับเสียงเป็น ${value} แล้ว`,
		resume: "เล่นต่อแล้ว",
		skip: "ข้ามเพลงแล้ว",
	},
	play: {
		not_join_voice_channel: "กรุณาเข้าช่องเสียงก่อนใช้คำสั่งนี้",
		not_same_voice_channel: "คุณไม่ได้อยู่ห้องเดียวกันกับบอท",
		search_404: "ดูเหมือนว่าบอทจะไม่หาเพลงที่คุณต้องการได้",
		playlist_author_name: "เพลย์ลิสต์ถูกเพิ่มลงในคิวแล้ว",
		track_author_name: "เพลงนี้ถูกเพิ่มลงในคิวแล้ว",
		added_song: "เพิ่มเพลงแล้ว",
		added_playlist: "เพิ่มเพลย์ลิสต์แล้ว",
		request: "ขอเพลงโดย",
		time: "ระยะเวลา",
		pause: "หยุดชั่วคราวแล้ว",
		not_playing: "ไม่มีเพลงที่กําลังเล่นอยู่",
		not_found: "ไม่พบเพลงที่คุณต้องการ",
		playlist: "เพลย์ลิสต์",
		track: "เพลง",
	},
	loop: {
		not_playing: "ไม่มีเพลงที่กําลังเล่นอยู่",
		specify_type: "กรุณาระบุประเภทของวน",
		loop_song: "วนเพลงแล้ว",
		loop_queue: "วนคิวแล้ว",
		loop_off: "ปิดวนรายการแล้ว",
	},
	filter: {
		specify_filter: "กรุณาระบุตัวกรอง",
		filter_not_found: "ไม่พบตัวกรอง",
		filter_already: "ตัวกรองนี้เปิดอยู่แล้ว",
		filter_cleared: "ล้างตัวกรองแล้ว",
		filter_success: (name) => `เปิดตัวกรอง ${name} แล้ว`,
		filter_removed: (name) => `ปิดตัวกรอง ${name} แล้ว`,
	}
} satisfies typeof English; // inherit types from default lang to ensure 1:1 locales
