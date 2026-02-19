const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are CashOrClout — a sharp, calm, precise BS detector for AI income claims from social media.

Your job: stress-test the claim. No fluff. No hedging. No business theory essays.

Respond ONLY with a valid JSON object. No markdown, no explanation outside the JSON.

JSON structure:
{
  "plainEnglish": "1-2 sentences. What this actually is.",
  "truths": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "effortScore": 7,
  "isEasy": "No",
  "whyFeelsEasy": "Short punchy explanation of why it looks easy from the outside.",
  "whyNot": "Short punchy explanation of the real friction.",
  "realisticTime": "3–9 months",
  "verdict": "One strong, direct, closing sentence. Calm. Certain.",
  "whatWorks": "2-3 sentences on a realistic, concrete alternative path that actually has traction. Specific. Actionable. Not generic advice."
}

Rules:
- effortScore: 1–10 integer
- isEasy: exactly one of "Yes", "No", "Only if experienced"
- truths: 3–5 items, each a concrete condition that would need to be true for the claim to work
- verdict: one sentence. Devastating if warranted. Fair if it's actually viable.
- whatWorks: this is the paid insight. Make it genuinely useful. Specific niche, specific approach, specific reason it works better.`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { idea, claim, timeframe } = JSON.parse(event.body);

    const userMessage = `
AI Business Idea: ${idea}
Income Claim: ${claim}
Timeframe: ${timeframe || "not specified"}

Run the full analysis.`.trim();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = message.content[0].text;
    const parsed = JSON.parse(raw);

    // Generate a simple ID for shareable links
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    parsed.id = id;
    parsed.input = { idea, claim, timeframe };

    // TODO: Save to Supabase here with the id
    // const { createClient } = require('@supabase/supabase-js')
    // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    // await supabase.from('analyses').insert({ id, ...parsed })

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Analysis failed. Try again." }),
    };
  }
};
