// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';

const MessagingResponse = require('twilio').twiml.MessagingResponse;

export default function receiveMessage(req: NextApiRequest, res: NextApiResponse) {
    const twiml = new MessagingResponse();

    twiml.message('The Robots are coming! Head for the hills! - Swapnil Srivastava');
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
}
