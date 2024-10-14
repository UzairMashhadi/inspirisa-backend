module.exports = {
  AWS_MEDIA_URL: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`,

  STATUS_CODE: {
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    SUCCESS: 200,
    CREATED: 201,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409
  },

  ERRORS: {
    //USER ERRORS
    alreadyWatchedTheEntireTopic: "You have already watched the entire topic",
    invalidTokenOrExpired: 'Token is either invalid or has expired.',
    passwordCannotBeSame: "New password cannot be the same as the old password.",
    passwordInvalid: "Invalid password!",
    accountExists: "Account exists with this email!",
    userNotExists: "User does not exist!",
    userAlreadyExists: "User already exists with this email!",
    optInvalid: "Invalid OTP or Not Verified",
    otpExpired: "Otp Expired, Request New One",
    inviteExpired: "Invite link is expired",
    inviteExists: "Invite is already sent to this email",
    inviteAlreadyUsed: "Invite is already used to register",
    invalidInviteLink: "Invitation link is expired! Please contact admin",
    invalidCurrentPassword: "Invalid Current Password",
    passwordChanged: "Your password has been reset successfully. You can now log in with your new password",
    invalidCredentials: "Invalid credentials",

    tokenInvalid: "Unauthorized access: Token not found",
    userNotFound: "Unauthorized access: User does not exist",
    unAuthorized: "Unauthorized access",
    emailInvalid: "Invalid Email",

    tokenExpired: "The token is invalid or has expired. Please request a new password reset.",
    tokenIsValid: "Token is valid."
  },

  TEXTS: {
    userCreated: "User created successfully!",
    userLogin: "User login successfully!",
    userLogout: "User logged out successfully!",
    userLoggedOut: "User logout successfully!",
    userUpdated: "User updated successfully!",
    passwordUpdated: "Password updated successfully!",
    otpVerified: "OTP verified successfully!",
    passwordResetEmailSent: "Reset email sent!",
    registerLinkSent: "Invite link sent successfully!",
    userAlreadyRegisteredWithEmail:
      "User is already registered with this email",
    inviteLinkEmailSubject: "WinRate Invite",
    inviteLinkVerified: "Invite Link is Verified",
    forgotPasswordEmailSubject: "WinRate Password Reset",
    inviteEmailSubject: "WinRate Invitation",
    supportEmailSubject: "WinRate Support Email",
    contractEndateUpdated: "Contract End Date updated",

    accountDeleted: "Account deleted successfully!",

    profileData: "Profile Data",
    profileUpdated: "Profile Updated",
    recordFetched: "Record fetched successfully!",
    recordNotFound: "Record not found",
    recordCreated: "Record created successfully!",
    recordUpdated: "Record updated successfully!",
    recordDeleted: "Record deleted successfully!",
    someThingWentWrong: "Something went wrong!",
    emailNotVerified: "Please verify your email to login",
    userNotFound: "User not found!",
    organizerNotFound: "Organizer not found!",
    paymentSavedSuccessfully: "payment saved successfully!",
    requiredFieldsMissing: "Required fields missing.",
    fileUploaded: "File uploaded successfully!",
    mediatypeReq: "type is required (image_url, images_url_array, video_url, doc)",
    fileUploaded: "File uploaded successfully!",
    fileDeleted: "File deleted successfully!",
    fileUploadingFail: "File fail to upload!",
    fileDeletionFail: "File fail to delete!",
    fileDownloading: "File downloading failed",
    resetPasswordEmailSent: "Password reset email has been sent successfully. Please check your inbox.",
    watchTimeAlreadyAdded: "Watched time for this topic already recorded",
    watchTimeAdded: "Watched topic created",
    passwordChangedSuccessfully: 'Your password has been successfully changed.',
    invalidCurrentPassword: 'The current password is incorrect.',
    passwordSameAsOld: 'The new password cannot be the same as the old password.',
    userRestoredBack: 'User restored back!',
    verificationEmailSentAgain: 'Your email is not verified. A new verification email has been sent to your inbox.'
  },

  ROLES: {
    ADMIN: "admin",
    CLIENT: "client",
  },

  STATUS: {
    ACTIVE: "active",
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    INPROGRESS: "inprogress",

    INACTIVE: "inactive",
    UNAPPROVED: "unapproved",
    APPROVED: "approved",
    VERIFIED: "verified",
    EXPIRED: "expired",
    USED: "used",
    COMPLETED: "completed",
    INCOMPLETE: "incomplete",
    VERFIFIED: "verified",
    CANCEL: "cancel",
    ENDED: "ended"
  }
};
