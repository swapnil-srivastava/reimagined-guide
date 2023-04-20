// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as postmark from "postmark";

export default function handler(req, res) {
  // Send an email:
  const client = new postmark.ServerClient(
    "2e7cd3fe-f589-4fa6-b0d5-2c1459e2af88"
  );

  client.sendEmail({
    From: "contact@swapnilsrivastava.eu",
    To: "contact@swapnilsrivastava.eu",
    Subject: "Hello from nextjs api",
    HtmlBody: "<strong>Hello</strong> dear Postmark user.",
    TextBody: "Hello from Postmark!",
    MessageStream: "outbound",
  });

  res.status(200).json("Email had been sent");
}
