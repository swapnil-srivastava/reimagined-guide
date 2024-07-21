import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe/stripe';

export async function POST(request: Request) { 
    try {
        const { priceId, email, userId } = await request.json();

        console.log("called the POST", priceId, email, userId)

        const session = await stripe.checkout.sessions.create({
            metadata: {
                user_id: userId,
            },
            customer_email: email,
            payment_method_types: ['card'],
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
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
