const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');
const CoursesController = require('../controllers/courses');
const EventsController = require("../controllers/events");

// Get all courses
router.get('/courses', CoursesController.getAllCourses);

// Get a single course by ID
router.get('/course/:id', CoursesController.getSingleCourseById);

// Get all events
router.get('/events', EventsController.getAllEvents);

// Get event details
router.get('/event/:id', EventsController.getSingleEventById);

router.post('/contact-us', async (req, res) => {

    try {
        const { firstName, lastName, email, contactNumber, questionOrRequest } = req?.body;
        const adminMailOptions = {
            to: process.env.EMAIL_USER,
            subject: 'New Contact Us Message',
            html: `
            <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333333;">New Contact Form Submission</h2>
                        <p style="font-size: 16px; color: #555555; line-height: 1.5;">
                            <strong>Name:</strong> ${firstName} ${lastName}<br>
                            <strong>Email:</strong> ${email}<br>
                            <strong>Contact Number:</strong> ${contactNumber}<br>
                            <strong>Message:</strong><br>
                            <p style="border: 1px solid #dddddd; padding: 10px; background-color: #f9f9f9;">${questionOrRequest}</p>
                        </p>
                        <p style="font-size: 14px; color: #777777; text-align: center;">
                            &copy; ${new Date().getFullYear()} Inspirisa. All rights reserved.
                        </p>
                    </div>
                </body>
            </html>
        `
        };

        await sendEmail(adminMailOptions.to, adminMailOptions.subject, adminMailOptions.html);

        const userMailOptions = {
            to: email,
            subject: 'Thank you for contacting us',
            html: `<p>Dear ${firstName + " " + lastName},</p><p>Thank you for reaching out to us. We have received your message and will get back to you soon.</p><p>Your message: ${questionOrRequest}</p>`
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
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
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
                            <p style="font-size: 14px; color: #777777; text-align: center;">
                                &copy; ${new Date().getFullYear()} Inspirisa. All rights reserved.
                            </p>
                        </div>
                    </body>
                </html>
            `
        };

        await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

        res.status(200).json({ status: 200, message: 'Subscription successful and confirmation email sent' });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ status: 500, message: 'Failed to subscribe to newsletter' });
    }
});

module.exports = router;
