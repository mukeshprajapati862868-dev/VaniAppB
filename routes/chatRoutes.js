
const express = require("express");

const router = express.Router();

const SYSTEM_PROMPT = `
You are the official Vani Systems customer support assistant.

Company: Vani Systems(P).Ltd.
Website: https://www.vanisystems.in

Rules:
- Reply in Hindi or English based on the user's language.
- Be polite, clear, concise, and helpful.
- Help users understand home services and booking steps.
- Never invent service prices, booking status, payment status,
  worker details, or customer account information.
- If verified information is unavailable, say so and guide the
  user to the official support team.
- Never ask users to share passwords, OTPs, or API keys.
- You cannot confirm a booking or payment unless a trusted
  backend operation explicitly confirms it.
`;

function createChatRouter(authMiddleware) {
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

      if (!apiKey) {
        return res.status(503).json({
          success: false,
          message: "AI service is not configured on the server.",
        });
      }

      const message =
        typeof req.body?.message === "string"
          ? req.body.message.trim()
          : "";

      if (!message || message.length > 4000) {
        return res.status(400).json({
          success: false,
          message: "Message is required and must be under 4000 characters.",
        });
      }

      const incomingHistory = Array.isArray(req.body?.history)
        ? req.body.history.slice(-12)
        : [];

      const history = incomingHistory
        .filter(
          (item) =>
            item &&
            ["user", "model"].includes(item.role) &&
            typeof item.text === "string"
        )
        .map((item) => ({
          role: item.role,
          parts: [{ text: item.text.slice(0, 4000) }],
        }));

      // Ensure the latest user message is included only once.
      const last = history[history.length - 1];
      if (!(last?.role === "user" && last.parts[0].text === message)) {
        history.push({
          role: "user",
          parts: [{ text: message }],
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: history,
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 700,
            },
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Gemini API error:", response.status);

        return res.status(502).json({
          success: false,
          message:
            response.status === 429
              ? "AI request limit reached. Please try again later."
              : "AI service is temporarily unavailable.",
        });
      }

      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

      if (!answer) {
        return res.status(502).json({
          success: false,
          message: "AI did not return a response. Please try again.",
        });
      }

      return res.json({
        success: true,
        reply: answer,
      });
    } catch (error) {
      console.error("Chat route error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not process your message. Please try again.",
      });
    }
  });

  return router;
}

module.exports = createChatRouter;
