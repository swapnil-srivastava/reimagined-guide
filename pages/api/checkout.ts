import { NextResponse } from 'next/server';
import { stripe } from '../../lib/stripe/stripe';

export async function POST(request: Request) { 
    try {
        const { priceId, email, userId } = await request.json();

        console.log("called the POST")

        const session = await stripe.checkout.sessions.create({
            metadata: {
                user_id: userId,
            },
            customer_email: email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/success`,
            cancel_url: `${request.headers.get('origin')}/cancel`,
        });

        return NextResponse.json({ id: session.id });
        
    } catch( error: any ) {
        console.log("catch block")
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
