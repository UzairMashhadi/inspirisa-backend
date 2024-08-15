const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const isEmailVerified = require('../../middleware/emailVerified')
const { responseFormatter } = require('../../utils/helper');
const { STATUS_CODE, ERRORS, TEXTS } = require('../../utils/texts');
const { sendEmail } = require('../../services/emailService');
const router = express.Router();
const prisma = new PrismaClient();

// Register user
router.post('/register', isEmailVerified, async (req, res, next) => {
  // const { fullName, email, password, role } = req.body;
  // try {
  //   // Check if user already exists
  //   const existingUser = await prisma.user.findUnique({ where: { email } });
  //   if (existingUser) {
  //     return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.userAlreadyExists);
  //   }

  //   // Hash password
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   // Generate a verification token
  //   const verificationToken = crypto.randomBytes(32).toString('hex');

  //   // Create new user
  //   const user = await prisma.user.create({
  //     data: {
  //       fullName,
  //       email,
  //       password: hashedPassword,
  //       role,
  //       verificationToken
  //     }
  //   });
  //   let addedUser = { ...user };
  //   delete addedUser.password;
  //   delete addedUser.verificationToken;
  //   // Create verification link
  //   const verificationLink = `${process.env.BASEURL}verify-email?token=${user?.verificationToken}`;

  //   // Send verification email
  //   const mailOptions = {
  //     to: email,
  //     subject: 'Email Verification',
  //     html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`
  //   };

  //   await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html);

  //   responseFormatter(res, STATUS_CODE.CREATED, { user: addedUser }, TEXTS.userCreated);
  // } catch (err) {
  //   next(err);
  // }
});

// Verify email endpoint
router.get('/verify-email', async (req, res, next) => {
  // const token = req?.query?.token;

  // try {
  //   // Find user by verification token
  //   const user = await prisma.user.findUnique({ where: { verificationToken: token } });
  //   if (!user) {
  //     return responseFormatter(res, STATUS_CODE.UNAUTHORIZED, {}, ERRORS.invalidToken);
  //   }

  //   // Update user to set isEmailVerified to true and clear the verification token
  //   await prisma.user.update({
  //     where: { id: user.id },
  //     data: {
  //       isEmailVerified: true,
  //       verificationToken: null
  //     }
  //   });

  //   res.send('Email verified successfully!');
  // } catch (err) {
  //   next(err);
  // }
});

// Login user
router.post('/login', async (req, res, next) => {
  // const { email, password } = req.body;
  // try {
  //   // Find user by email
  //   const user = await prisma.user.findUnique({ where: { email } });
  //   if (!user) {
  //     return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.userNotExists);
  //   }

  //   // Check password
  //   const isMatch = await bcrypt.compare(password, user.password);
  //   if (!isMatch) {
  //     return responseFormatter(res, STATUS_CODE.CONFLICT, {}, ERRORS.passwordInvalid);
  //   }

  //   // Generate token
  //   const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10h' });

  //   responseFormatter(res, STATUS_CODE.SUCCESS, { token }, TEXTS.userLogin);
  // } catch (err) {
  //   next(err);
  // }
});

module.exports = router;
