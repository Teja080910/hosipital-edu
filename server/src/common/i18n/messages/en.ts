const en = {
  "auth": {
    "emailInUse": "Email already in use",
    "emailNotFound": "Email not found",
    "incorrectPassword": "Incorrect password",
    "invalidCredentials": "Invalid credentials",
    "accountMigrated": "Your account was migrated. Please check your email to set a new password.",
    "userNotFound": "User not found",
    "invalidToken": "Invalid token",
    "tokenExpired": "Invalid or expired token",
    "emailVerified": "Email verified successfully",
    "emailAlreadyVerified": "Email already verified",
    "verificationSent": "Verification email sent",
    "ifEmailExists": "If the email exists, a verification link has been sent",
    "passwordResetSent": "Password reset email sent",
    "ifEmailExistsReset": "If the email exists, a reset link has been sent",
    "passwordResetSuccess": "Password reset successfully",
    "loggedOut": "Logged out successfully",
    "accessDenied": "Access denied"
  },
  "users": {
    "notFound": "User not found",
    "deleted": "User deleted",
    "accessDenied": "Access denied"
  },
  "courses": {
    "notFound": "Course not found",
    "deleted": "Course deleted",
    "alreadyEnrolled": "Already enrolled in this course",
    "paymentRequired": "Payment required for this course",
    "moduleNotFound": "Module not found",
    "moduleDeleted": "Module deleted",
    "lessonNotFound": "Lesson not found",
    "lessonDeleted": "Lesson deleted",
    "commentNotFound": "Comment not found",
    "notYourComment": "Not your comment",
    "commentDeleted": "Comment deleted",
    "progressNotFound": "Progress record not found",
    "quizNotFound": "Quiz not found",
    "quizAlreadyPassed": "Quiz already passed",
    "quizAttemptNotFound": "Quiz attempt not found",
    "quizAlreadySubmitted": "Quiz already submitted"
  },
  "questions": {
    "notFound": "Question not found",
    "deleted": "Question deleted"
  },
  "exams": {
    "notFound": "Exam not found",
    "attemptNotFound": "Attempt not found",
    "noActiveSubscription": "No active subscription found.",
    "planOnlyCourses": "Your plan only grants access to courses, not exams.",
    "subscriptionNotIncludeExam": "Your subscription does not include this exam type.",
    "noRemainingAttempts": "No remaining exam attempts. Please upgrade your plan.",
    "usageLimitExceeded": "You have exceeded the total usage limit for your plan.",
    "planExpired": "Your plan duration has expired."
  },
  "flashcards": {
    "notFound": "Flashcard not found",
    "deleted": "Flashcard deleted",
    "noRemainingAttempts": "No remaining flashcard attempts. Please upgrade your plan."
  },
  "subscriptions": {
    "planNotFound": "Plan not found",
    "noActiveSubscription": "No active subscription",
    "descriptionTemplate": "{name} - {interval}"
  },
  "articles": {
    "notFound": "Article not found",
    "deleted": "Article deleted",
    "slugExists": "An article with this slug already exists"
  },
  "certificates": {
    "notFound": "Certificate not found or invalid",
    "noDefaultTemplate": "No default certificate template found",
    "courseNotFound": "Course not found",
    "userNotFound": "User not found"
  },
  "parameters": {
    "notFound": "Parameter not found",
    "deleted": "Parameter deleted"
  },
  "translations": {
    "duplicateKey": "A translation with this key and locale already exists",
    "autoTranslateDone": "Auto-translate from {source} to {target} complete"
  },
  "guard": {
    "notAuthenticated": "Authentication required",
    "subscriptionExamDenied": "Your subscription does not include access to this exam.",
    "accountTypeDenied": "Your account type does not have access to this resource."
  },
  "common": {
    "internalError": "Internal server error",
    "eventDeleted": "Event deleted",
    "mailNotConfigured": "Mail not configured - skipping send"
  },
  "stream": {
    "failedListVideos": "Failed to list videos",
    "videoNotFound": "Video not found",
    "failedDeleteVideo": "Failed to delete video",
    "failedGenerateToken": "Failed to generate token",
    "failedGenerateUploadUrl": "Failed to generate upload URL"
  },
  "email": {
    "subjects": {
      "verifyEmail": "Verify your email address",
      "welcome": "Welcome to MD Exams!",
      "passwordReset": "Reset your password",
      "passwordChanged": "Your password has been changed",
      "subscriptionConfirmed": "Subscription confirmed",
      "subscriptionCancelled": "Subscription cancelled",
      "paymentFailed": "Payment failed"
    },
    "verifyEmail": {
      "heading": "Verify your email address",
      "body": "Hi {name}, thanks for creating your MD Exams account. Please verify your email address to unlock full access to our medical exam preparation platform.",
      "button": "Verify Email",
      "footer": "This link expires in 24 hours. If you didn&rsquo;t sign up for MD Exams, you can safely ignore this email."
    },
    "welcome": {
      "heading": "Welcome to MD Exams!",
      "body1": "Hi {name}, your email has been verified successfully. You now have full access to everything MD Exams has to offer.",
      "body2": "Start exploring medical courses, practice with exam-style questions, track your progress with detailed analytics, and prepare with confidence.",
      "button": "Go to Dashboard",
      "footer": "Need help? Contact our support team at support@md-exams.com."
    },
    "passwordReset": {
      "heading": "Reset your password",
      "body": "Hi {name}, we received a request to reset the password for your MD Exams account. Click the button below to create a new password.",
      "button": "Reset Password",
      "footer": "This link expires in 1 hour. If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password will remain unchanged."
    },
    "passwordChanged": {
      "heading": "Your password has been changed",
      "body1": "Hi {name}, your MD Exams account password was successfully changed.",
      "body2": "If you made this change, no further action is needed. If you did not change your password, please contact our support team immediately to secure your account.",
      "button": "Go to Dashboard",
      "footer": "Questions? Contact support@md-exams.com."
    },
    "subscriptionConfirmed": {
      "heading": "Subscription confirmed!",
      "body1": "Hi {name}, thank you for subscribing to MD Exams. Your payment was successful and your account is now active.",
      "planLabel": "Plan",
      "amountLabel": "Amount",
      "billingLabel": "Billing",
      "body2": "You now have unlimited access to all courses, practice questions, flashcards, exam simulators, and detailed performance analytics.",
      "button": "Start Learning",
      "footer": "Need help? Reply to this email or contact support@md-exams.com."
    },
    "subscriptionCancelled": {
      "heading": "Subscription cancelled",
      "body1": "Hi {name}, your MD Exams subscription has been cancelled. You will continue to have access until the end of your current billing period.",
      "body2": "We&rsquo;d love to have you back whenever you&rsquo;re ready. Your progress and data will be preserved.",
      "button": "Resubscribe",
      "footer": "If you cancelled by mistake, you can resubscribe at any time."
    },
    "paymentFailed": {
      "heading": "Payment failed",
      "body1": "Hi {name}, we were unable to process your latest subscription payment. Don&rsquo;t worry &mdash; we&rsquo;ll try again in a few days.",
      "body2": "To avoid any interruption to your access, please update your payment method as soon as possible.",
      "button": "Update Payment Method",
      "footer": "If you need assistance, contact support@md-exams.com."
    }
  }
} as const;

export default en;
