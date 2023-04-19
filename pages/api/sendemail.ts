// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const postmark = require("postmark");

const client = new postmark.ServerClient(process.env.EMAIL_KEY);

export default function handler(req, res) {
  console.log("process.env.EMAIL_KEY", process.env.EMAIL_KEY);

  client.sendEmail({
    "From": "contact@swapnilsrivastava.eu",
    "To": "contact@swapnilsrivastava.eu",
    "Subject": "Hello from Postmark",
    "HtmlBody": "<strong>Hello</strong> dear Postmark user.",
    "TextBody": "Hello from Postmark!",
    "MessageStream": "broadcast"
  });

  res.status(200).json("Email had been sent");
}
