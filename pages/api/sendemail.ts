// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const postmark = require("postmark");

// Send an email:
const client = new postmark.ServerClient(process.env.EMAIL_KEY);

export default function handler(req, res) {
  client.sendEmail({
    "From": "contact@swapnilsrivastava.eu",
    "To": "contact@swapnilsrivastava.eu",
    "Subject": "Hello from Postmark",
    "HtmlBody": "<strong>Hello</strong> dear Postmark user.",
    "TextBody": "Hello from Postmark!",
    "MessageStream": "outbound"
  });

  res.status(200).json("Email had been sent");
}
