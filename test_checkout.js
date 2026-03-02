const Stripe = require('stripe');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
    try {
        console.log("Using Price ID:", process.env.STRIPE_PRICE_ID);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
            mode: 'subscription',
            success_url: `http://localhost:3000/courses?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `http://localhost:3000/courses?canceled=true`,
            client_reference_id: 'test_user_id',
            customer_email: 'test@example.com',
        });
        console.log("Success:", session.url);
    } catch (err) {
        console.error("Error:", err.message);
    }
}
main();
