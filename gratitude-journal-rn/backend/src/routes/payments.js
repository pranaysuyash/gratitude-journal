/**
 * Payments Routes
 * Stripe payment integration
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Get subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'usd',
        interval: 'month',
        features: [
          '10 entries per month',
          'Basic analytics',
          '3 themes',
          'Standard export'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 4.99,
        currency: 'usd',
        interval: 'month',
        priceId: process.env.STRIPE_PRICE_ID_PREMIUM,
        features: [
          'Unlimited entries',
          'Advanced AI features',
          'All themes',
          'Priority support',
          'Video montages',
          'NFT minting (3/month)'
        ]
      },
      {
        id: 'family',
        name: 'Family',
        price: 9.99,
        currency: 'usd',
        interval: 'month',
        priceId: process.env.STRIPE_PRICE_ID_FAMILY,
        features: [
          'Everything in Premium',
          'Up to 6 family members',
          'Shared family journal',
          'Group challenges',
          'NFT minting (10/month)'
        ]
      }
    ];

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Create checkout session
 */
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return res.status(501).json({
        success: false,
        message: 'Stripe not configured'
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      client_reference_id: req.user._id.toString(),
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Webhook handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;

        // Update user subscription
        await User.findByIdAndUpdate(userId, {
          'subscription.tier': 'premium',
          'subscription.status': 'active',
          'subscription.stripeCustomerId': session.customer,
          'subscription.stripeSubscriptionId': session.subscription
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          {
            'subscription.status': subscription.status
          }
        );

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          {
            'subscription.tier': 'free',
            'subscription.status': 'expired'
          }
        );

        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
