// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import * as postmark from "postmark";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new postmark.ServerClient(
    "2d92b8f0-fcc5-46e0-b368-98a4b9186755"
  );

  try {
    const response = await client.sendEmail({
      From: "contact@swapnilsrivastava.eu",
      To: "contact@swapnilsrivastava.eu",
      Subject: "Hello from Swapnil's Note",
      HtmlBody:
        "<strong>Hello</strong> dear Swapnil's Notes user, please visit https://swapnilsrivastava.eu for more info.",
      TextBody: "Hello from Postmark!",
      MessageStream: "outbound",
    });
    res.status(200).json("Email had been sent");
  } catch (error) {
    res.status(501).json({ message: "Failed to send email." });
  }
}
