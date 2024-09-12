const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');
const CoursesController = require('../controllers/courses');
const EventsController = require("../controllers/events");
const { generateEmailHtml } = require('../utils/helper');

router.get('/courses', CoursesController.getAllCourses);

router.get('/course/:id', CoursesController.getSingleCourseById);

router.get('/events', EventsController.getAllEvents);

router.get('/event/:id', EventsController.getSingleEventById);

router.post('/contact-us', async (req, res) => {

    try {
        const { firstName, lastName, email, contactNumber, questionOrRequest } = req?.body;
        const adminMailOptions = {
            to: process.env.EMAIL_USER,
            subject: 'Contact us',
            html: generateEmailHtml(
                `<html>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
                            <h2 style="color: #333333;">New Contact Form Submission</h2>
                            <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                                <strong>Name:</strong> ${firstName} ${lastName}<br>
                                <strong>Email:</strong> ${email}<br>
                                <strong>Contact Number:</strong> ${contactNumber}<br>
                                <strong>Message:</strong><br>
                                <p style="border: 1px solid #dddddd; padding: 10px; background-color: #f9f9f9;">${questionOrRequest}</p>
                            </p>
                    </body>
                </html>`)
        };

        await sendEmail(adminMailOptions.to, adminMailOptions.subject, adminMailOptions.html);

        const userMailOptions = {
            to: email,
            subject: 'Thank you for contacting us!',
            html: generateEmailHtml(
                `<p>Dear ${firstName + " " + lastName},</p><p>Thank you for reaching out to us. We have received your message and will get back to you soon.</p><p>Your message: ${questionOrRequest}</p>`
            )
        };

        await sendEmail(userMailOptions.to, userMailOptions.subject, userMailOptions.html);

        res.status(200).json({ status: 200, message: 'Contact message sent successfully' });
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ status: 400, message: 'Failed to send contact message' });
    }
});

router.post('/subscribe', async (req, res) => {
    const { email } = req?.body;

    if (!email) {
        return res.status(400).json({ status: 400, message: 'Email is required' });
    }

    try {
        const mailOptions = {
            to: email,
            subject: 'Newsletter Subscription Confirmation',
            html: generateEmailHtml(`
                <html>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
                            <h2 style="color: #333333;">Thank you for subscribing!</h2>
                            <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                                Dear Subscriber,
                            </p>
                            <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                                Thank you for subscribing to our newsletter! We're excited to keep you updated with the latest news and updates.
                            </p>
                            <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                                If you have any questions or feedback, feel free to reach out to us.
                            </p>
                    </body>
                </html>`)
        };

        await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

        res.status(200).json({ status: 200, message: 'Subscription successful and confirmation email sent' });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ status: 500, message: 'Failed to subscribe to newsletter' });
    }
});

module.exports = router;
