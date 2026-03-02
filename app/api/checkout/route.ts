import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-02-24.acacia' as any,
        });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get or construct a checkout session
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // NOTE: In production, hardcode the STRIPE_PRICE_ID in your .env.local
        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
            return NextResponse.json({ error: 'Configuration Error: Missing Stripe Price ID. Please add STRIPE_PRICE_ID to your .env.local file.' }, { status: 500 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                }
            ],
            mode: 'subscription',
            success_url: `${origin}/courses?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${origin}/courses?canceled=true`,
            client_reference_id: user.id, // Very important: this links the stripe payload to our Supabase user
            customer_email: user.email,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err.message);
        return NextResponse.json({ error: 'Could not create checkout session', details: err.message }, { status: 500 });
    }
}
