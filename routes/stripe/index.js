const express = require('express');
const buffer = require('micro').buffer;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

const {
    createPaymentIntent,
    attachPaymentMethod,
    savePaymentHistory,
    getPaymentMethods,
    handleWebhook,
    updatePaymentMethodMetadata,
    detachPaymentMethod
} = require('../../services/stripe');
const { responseFormatter } = require('../../utils/helper');
const { TEXTS, STATUS_CODE } = require('../../utils/texts');

const YOUR_DOMAIN = process.env.BASEURL;

router.post('/create-payment-intent', async (req, res, next) => {
    try {
        const { amount, currency = 'usd', courseId, userId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: currency,
            payment_method_types: ['card'],
            metadata: { courseId, userId },
        });
        console.log("paymentIntent", paymentIntent)
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        next(error);
    }
});

router.post('/payment-status', async (req, res) => {
    const { amount, currency = "usd", courseId, userId, paymentIntentId } = req?.body;
    if (!amount || !paymentIntentId || !courseId || !userId) {
        return responseFormatter(res, STATUS_CODE.BAD_REQUEST, {}, TEXTS.requiredFieldsMissing);
    }
    await savePaymentHistory(res, amount, currency, courseId, userId, paymentIntentId);

    responseFormatter(res, STATUS_CODE.SUCCESS, {}, TEXTS.paymentSavedSuccessfully);
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const reqBuffer = req.body;
    console.log('sig', sig)

    try {
        const event = handleWebhook(reqBuffer, sig);

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('PaymentIntent was successful!', paymentIntent);

                // await savePaymentHistory({
                //     customerId: paymentIntent.customer,
                //     amount: paymentIntent.amount,
                //     currency: paymentIntent.currency,
                //     paymentIntentId: paymentIntent.id,
                //     courseId: paymentIntent.metadata.courseId
                // });

                break;

            case 'payment_intent.payment_failed':
                console.log('PaymentIntent failed!', event.data.object);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).json({ event, received: true });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/attach-payment-method', async (req, res) => {
    try {
        const { customerId, paymentMethodId } = req.body;

        if (!customerId || !paymentMethodId) {
            return res.status(400).json({ error: 'Missing customerId or paymentMethodId' });
        }

        const result = await attachPaymentMethod(customerId, paymentMethodId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/payment-methods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const paymentMethods = await getPaymentMethods(id);
        res.status(200).json(paymentMethods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/edit-payment-method', async (req, res) => {
    try {
        const { paymentMethodId, metadata } = req.body;
        const updatedPaymentMethod = await updatePaymentMethodMetadata(paymentMethodId, metadata);
        res.status(200).json(updatedPaymentMethod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/delete-payment-method', async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const detachedPaymentMethod = await detachPaymentMethod(paymentMethodId);
        res.status(200).json(detachedPaymentMethod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
