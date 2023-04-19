// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const postmark = require("postmark");

const client = new postmark.ServerClient(process.env.EMAIL_KEY);

export default function handler(req, res) {
  console.log("process.env.EMAIL_KEY", process.env.EMAIL_KEY);
  client.sendEmail({
    From: "support@swapnilsrivastava.eu",
    To: "swapnilsrivastava68@hotmail.com",
    Subject: "Hello from Swapnil's Note",
    HtmlBody:
      "<strong>Hello</strong> dear Swapnil's Notes user, please visit https://swapnilsrivastava.eu for more info.",
    TextBody: "Hello from Swapnil's Notes!",
    MessageStream: "outbound",
  });

  res.status(200).json("Email had been sent");
}
