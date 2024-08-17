module.exports = {

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
    passwordChanged: "Password Updated",
    invalidCredentials: "Invalid credentials",

    tokenInvalid: "Unauthorized access: Token not found",
    userNotFound: "Unauthorized access: User does not exist",
    unAuthorized: "Unauthorized access",
    emailInvalid: "Invalid Email",

    tokenExpired: "Token expired!",
  },

  TEXTS: {
    userCreated: "User created successfully",
    userLogin: "User login successfully",
    userLogout: "User logged out successfully",
    userLoggedOut: "User logout successfully",
    userUpdated: "User updated successfully",
    passwordUpdated: "Password updated successfully",
    otpVerified: "OTP verified successfully",
    passwordResetEmailSent: "Reset email sent!",
    registerLinkSent: "Invite link sent successfully",
    userAlreadyRegisteredWithEmail:
      "User is already registered with this email",
    inviteLinkEmailSubject: "WinRate Invite",
    inviteLinkVerified: "Invite Link is Verified",
    forgotPasswordEmailSubject: "WinRate Password Reset",
    inviteEmailSubject: "WinRate Invitation",
    supportEmailSubject: "WinRate Support Email",
    contractEndateUpdated: "Contract End Date updated",

    accountDeleted: "Account deleted successfully",

    profileData: "Profile Data",
    profileUpdated: "Profile Updated",
    recordFetched: "Record fetched successfully",
    recordNotFound: "Record not found",
    recordCreated: "Record created successfully",
    recordUpdated: "Record updated successfully",
    recordDeleted: "Record deleted successfully",
    someThingWentWrong: "Something went wrong!",
    emailNotVerified: "Please verify your email to login",
    userNotFound: "User not found!",
    organizerNotFound: "Organizer not found!"

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
