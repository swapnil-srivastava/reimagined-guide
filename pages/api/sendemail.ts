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

    const response = await client.sendEmail({
      From: process.env.EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: "outbound",
    });

    res.status(200).json("Email had been sent");
  } catch (error) {
    res.status(500).json({ message: "Failed to send email." });
  }
}
