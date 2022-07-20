// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const postmark = require("postmark");

const client = new postmark.ServerClient("2d92b8f0-fcc5-46e0-b368-98a4b9186755");

export default function handler(req, res) {

    client.sendEmail({
        "From": "support@swapnilsrivastava.eu",
        "To": "swapnilsrivastava68@hotmail.com",
        "Subject": "Hello from Swapnil's Note",
        "HtmlBody": "<strong>Hello</strong> dear Swapnil's Notes user, please visit https://swapnilsrivastava.eu for more info.",
        "TextBody": "Hello from Swapnil's Notes!",
        "MessageStream": "outbound"
      });

    res.status(200).json("Email had been sent")
  }
  