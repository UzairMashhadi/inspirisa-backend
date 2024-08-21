const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const { responseFormatter } = require('../../utils/helper');
const { STATUS_CODE, TEXTS } = require('../../utils/texts');

const prisma = new PrismaClient();

const createPaymentIntent = async (amount, currency, customerId, paymentMethodId, courseId, returnUrl = 'http://localhost:5000/api/courses') => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: customerId,
            payment_method: paymentMethodId,
            confirmation_method: 'manual',
            confirm: true,
            metadata: { courseId },
            return_url: returnUrl
        });

        if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
            return { clientSecret: paymentIntent.client_secret, requiresAction: true };
        }

        return { clientSecret: paymentIntent.client_secret, success: true };
    } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        throw new Error(error.message);
    }
};

const handleWebhook = (reqBuffer, signature) => {
    try {
        const payloadString = reqBuffer.toString('utf8');
        const event = stripe.webhooks.constructEvent(
            payloadString,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        return event;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
};

const attachPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });

        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        return { success: true, paymentMethod };
    } catch (error) {
        throw new Error(error.message);
    }
};

const savePaymentHistory = async (res, amount, currency, courseId, userId, paymentIntentId) => {
    try {
        await prisma.userCourse.create({
            data: {
                courseId,
                userId,
            }
        })

        await prisma.paymentHistory.create({
            data: {
                amount,
                currency,
                courseId,
                userId,
                stripePaymentIntentId: paymentIntentId,
            }
        })

    } catch (error) {
        throw new Error(error.message);
    }
};

const getPaymentMethods = async (customerId) => {
    try {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        return paymentMethods;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updatePaymentMethodMetadata = async (paymentMethodId, metadata) => {
    try {
        const paymentMethod = await stripe.paymentMethods.update(paymentMethodId, {
            metadata: metadata
        });
        return paymentMethod;
    } catch (error) {
        console.error('Error updating payment method metadata:', error);
        throw new Error(error.message);
    }
};

const detachPaymentMethod = async (paymentMethodId) => {
    try {
        const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
        return paymentMethod;
    } catch (error) {
        console.error('Error detaching payment method:', error);
        throw new Error(error.message);
    }
};

module.exports = {
    createPaymentIntent,
    attachPaymentMethod,
    savePaymentHistory,
    getPaymentMethods,
    handleWebhook,
    updatePaymentMethodMetadata,
    detachPaymentMethod
};
