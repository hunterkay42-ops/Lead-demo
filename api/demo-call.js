// Serverless endpoint: POST -> places a call via Twilio
import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_CALLER_ID,   // +17822027259  (your Twilio number)
    TWIML_URL,          // your TwiML Bin URL
    DEMO_TARGET_NUMBER  // phone to ring for demo, e.g. +1XXXXXXXXXX
  } = process.env;

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const isDemo = body?.demo === true || String(body?.demo).toLowerCase?.() === "true";

    const leadPhone =
      body.phone || body?.contact?.phone || body?.["contact.phone"] || body?.lead_phone;

    const to = isDemo ? DEMO_TARGET_NUMBER : leadPhone;
    if (!to) return res.status(400).json({ ok: false, error: "missing target phone" });

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const call = await client.calls.create({
      to,
      from: TWILIO_CALLER_ID,
      url: TWIML_URL,
      machineDetection: "DetectMessageEnd"
    });

    return res.status(200).json({ ok: true, sid: call.sid });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}
