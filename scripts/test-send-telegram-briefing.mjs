import https from "node:https";
import { generateMorningBriefing } from "./engines/orchestration/morning-briefing-engine.mjs";

const token = "8982040736:AAG4lSjsV0hX-w9la06xnbI7Z5ZZMI0p7Aw";
const chatId = 5281600644;
const text = generateMorningBriefing({});

const payload = JSON.stringify({
  chat_id: chatId,
  text: text,
  parse_mode: "HTML"
});

const req = https.request({
  hostname: "api.telegram.org",
  path: `/bot${token}/sendMessage`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload)
  }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("Telegram Response Status:", res.statusCode);
    console.log("Response Body:", data);
  });
});

req.on("error", (e) => {
  console.error("Telegram Error:", e.message);
});

req.write(payload);
req.end();