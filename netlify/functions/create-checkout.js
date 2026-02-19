const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { analysisId } = JSON.parse(event.body);
    const origin = event.headers.origin || "https://cashorclout.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_1T2R7bEeXYHG1BG460BZeRaZ",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/result/${analysisId}?unlocked=true`,
      cancel_url: `${origin}/result/${analysisId}`,
      metadata: { analysisId },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Payment setup failed." }),
    };
  }
};
