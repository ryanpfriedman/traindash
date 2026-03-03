import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-02-25.clover',
    });

    // We need a Service Role key to bypass RLS in the webhook because there is no active user session
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const bodyText = await req.text();
    const sig = req.headers.get('Stripe-Signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing stripe configurations' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(bodyText, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const userId = session.client_reference_id; // This was passed during checkout

                if (userId) {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            stripe_customer_id: customerId,
                            subscription_status: 'active'
                        })
                        .eq('id', userId);
                }
                break;
            }
            case 'customer.subscription.deleted':
            case 'customer.subscription.paused': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                await supabaseAdmin
                    .from('profiles')
                    .update({ subscription_status: 'inactive' })
                    .eq('stripe_customer_id', customerId);
                break;
            }
            // Add other events if you want to handle past_due, trial ends, etc.
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Webhook processing failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
