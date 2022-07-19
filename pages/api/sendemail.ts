// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import postmark from "postmark";

var client = new postmark.ServerClient("2d92b8f0-fcc5-46e0-b368-98a4b9186755");

export default function handler(req, res) {
    
    client.sendEmail({
        "From": "contact@swapnilsrivastava.eu",
        "To": "contact@swapnilsrivastava.eu",
        "Subject": "Hello from Postmark",
        "HtmlBody": "<strong>Hello</strong> dear Postmark user.",
        "TextBody": "Hello from Postmark!",
        "MessageStream": "outbound"
      });

    res.status(200).json("Email had been sent")
  }
  