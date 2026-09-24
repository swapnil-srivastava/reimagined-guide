// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import { getAuthedRequest } from "../../lib/server/supabase-user";
import { ADMIN_EMAIL, sendMail } from "../../lib/server/mailer";

// Sends a message to the site inbox. Only the signed-in admin may use it, and
// the recipient is fixed so this route cannot be used to relay mail elsewhere.
// Post workflow emails are sent by /api/posts/submit and /api/posts/review.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authed = await getAuthedRequest(req);
  if (!authed || authed.user.id !== process.env.NEXT_PUBLIC_SWAPNIL_ID) {
    return res.status(401).json({ message: "Not authorized." });
  }

  const { Subject: emailSubject, HtmlBody: emailHtmlBody } = req.body ?? {};

  const sent = await sendMail(
    ADMIN_EMAIL,
    String(emailSubject ?? "Message from swapnilsrivastava.eu"),
    String(emailHtmlBody ?? "")
  );

  if (!sent) {
    return res.status(500).json({ message: "Failed to send email." });
  }

  res.status(200).json("Email had been sent");
}
