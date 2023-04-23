// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import * as postmark from "postmark";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new postmark.ServerClient(process.env.EMAIL_KEY);

  try {
    const { to, subject, htmlBody, textBody, messageStream } = req.body;
    console.log("to ======>", to);
    const response = await client.sendEmail({
      From: process.env.EMAIL,
      To: "swapnilsrivastava68@hotmail.com",
      Subject: "Hello from Swapnil's Note",
      HtmlBody:
        "<strong>Hello</strong> dear Swapnil's Notes user, please visit https://swapnilsrivastava.eu for more info.",
      TextBody: "Hello from Postmark!",
      MessageStream: "outbound",
    });
    res.status(200).json("Email had been sent");
  } catch (error) {
    res.status(500).json({ message: "Failed to send email." });
  }
}
