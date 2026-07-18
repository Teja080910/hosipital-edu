export const mailMessages: Record<string, any> = {
  en: {
    verifyEmail: {
      heading: "Verify your email address",
      body: "Hi {name}, thanks for creating your MD Exam account. Please verify your email address to unlock full access to our medical exam preparation platform.",
      button: "Verify Email",
      footer: "This link expires in 24 hours. If you didn&rsquo;t sign up for MD Exam, you can safely ignore this email.",
      subject: "Verify your email address",
    },
    welcome: {
      heading: "Welcome to MD Exam!",
      body1: "Hi {name}, your email has been verified successfully. You now have full access to everything MD Exam has to offer.",
      body2: "Start exploring medical courses, practice with exam-style questions, track your progress with detailed analytics, and prepare with confidence.",
      button: "Go to Dashboard",
      footer: "Need help? Contact our support team at soporte@md-exam.com.",
      subject: "Welcome to MD Exam!",
    },
    passwordReset: {
      heading: "Reset your password",
      body: "Hi {name}, we received a request to reset the password for your MD Exam account. Click the button below to create a new password.",
      button: "Reset Password",
      footer: "This link expires in 1 hour. If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password will remain unchanged.",
      subject: "Reset your password",
    },
    passwordChanged: {
      heading: "Your password has been changed",
      body1: "Hi {name}, your MD Exam account password was successfully changed.",
      body2: "If you made this change, no further action is needed. If you did not change your password, please contact our support team immediately to secure your account.",
      button: "Go to Dashboard",
      footer: "Questions? Contact soporte@md-exam.com.",
      subject: "Your password has been changed",
    },
    subscriptionConfirmed: {
      heading: "Subscription confirmed!",
      body1: "Hi {name}, thank you for subscribing to MD Exam. Your payment was successful and your account is now active.",
      planLabel: "Plan",
      amountLabel: "Amount",
      billingLabel: "Billing",
      body2: "You now have unlimited access to all courses, practice questions, flashcards, exam simulators, and detailed performance analytics.",
      button: "Start Learning",
      footer: "Need help? Reply to this email or contact soporte@md-exam.com.",
      subject: "Subscription confirmed",
    },
    subscriptionCancelled: {
      heading: "Subscription cancelled",
      body1: "Hi {name}, your MD Exam subscription has been cancelled. You will continue to have access until the end of your current billing period.",
      body2: "We&rsquo;d love to have you back whenever you&rsquo;re ready. Your progress and data will be preserved.",
      button: "Resubscribe",
      footer: "If you cancelled by mistake, you can resubscribe at any time.",
      subject: "Subscription cancelled",
    },
    paymentFailed: {
      heading: "Payment failed",
      body1: "Hi {name}, we were unable to process your latest subscription payment. Don&rsquo;t worry &mdash; we&rsquo;ll try again in a few days.",
      body2: "To avoid any interruption to your access, please update your payment method as soon as possible.",
      button: "Update Payment Method",
      footer: "If you need assistance, contact soporte@md-exam.com.",
      subject: "Payment failed",
    },
  },
  es: {
    verifyEmail: {
      heading: "Verifica tu dirección de correo",
      body: "Hola {name}, gracias por crear tu cuenta de MD Exam. Verifica tu correo para desbloquear el acceso completo a nuestra plataforma de preparación de exámenes médicos.",
      button: "Verificar Correo",
      footer: "Este enlace expira en 24 horas. Si no creaste una cuenta en MD Exam, puedes ignorar este correo.",
      subject: "Verifica tu dirección de correo",
    },
    welcome: {
      heading: "¡Bienvenido a MD Exam!",
      body1: "Hola {name}, tu correo ha sido verificado exitosamente. Ahora tienes acceso completo a todo lo que MD Exam ofrece.",
      body2: "Comienza a explorar cursos médicos, practica con preguntas tipo examen, sigue tu progreso y prepárate con confianza.",
      button: "Ir al Panel",
      footer: "¿Necesitas ayuda? Contacta a nuestro equipo de soporte en soporte@md-exam.com.",
      subject: "¡Bienvenido a MD Exam!",
    },
    passwordReset: {
      heading: "Restablece tu contraseña",
      body: "Hola {name}, recibimos una solicitud para restablecer la contraseña de tu cuenta de MD Exam. Haz clic en el botón para crear una nueva contraseña.",
      button: "Restablecer Contraseña",
      footer: "Este enlace expira en 1 hora. Si no solicitaste un restablecimiento, puedes ignorar este correo &mdash; tu contraseña no cambiará.",
      subject: "Restablece tu contraseña",
    },
    passwordChanged: {
      heading: "Tu contraseña ha sido cambiada",
      body1: "Hola {name}, la contraseña de tu cuenta de MD Exam fue cambiada exitosamente.",
      body2: "Si hiciste este cambio, no necesitas hacer nada más. Si no cambiaste tu contraseña, contacta a nuestro equipo de soporte inmediatamente.",
      button: "Ir al Panel",
      footer: "¿Preguntas? Contacta a soporte@md-exam.com.",
      subject: "Tu contraseña ha sido cambiada",
    },
    subscriptionConfirmed: {
      heading: "¡Suscripción confirmada!",
      body1: "Hola {name}, gracias por suscribirte a MD Exam. Tu pago fue exitoso y tu cuenta ya está activa.",
      planLabel: "Plan",
      amountLabel: "Monto",
      billingLabel: "Facturación",
      body2: "Ahora tienes acceso ilimitado a todos los cursos, preguntas de práctica, tarjetas de estudio, simuladores de examen y análisis detallados.",
      button: "Comenzar a Aprender",
      footer: "¿Necesitas ayuda? Responde a este correo o contacta a soporte@md-exam.com.",
      subject: "Suscripción confirmada",
    },
    subscriptionCancelled: {
      heading: "Suscripción cancelada",
      body1: "Hola {name}, tu suscripción de MD Exam ha sido cancelada. Seguirás teniendo acceso hasta el final de tu período de facturación actual.",
      body2: "Nos encantaría tenerte de vuelta cuando estés listo. Tu progreso y datos se conservarán.",
      button: "Volver a Suscribirse",
      footer: "Si cancelaste por error, puedes volver a suscribirte en cualquier momento.",
      subject: "Suscripción cancelada",
    },
    paymentFailed: {
      heading: "Pago fallido",
      body1: "Hola {name}, no pudimos procesar tu último pago de suscripción. No te preocupes &mdash; lo intentaremos de nuevo en unos días.",
      body2: "Para evitar cualquier interrupción en tu acceso, actualiza tu método de pago lo antes posible.",
      button: "Actualizar Método de Pago",
      footer: "Si necesitas ayuda, contacta a soporte@md-exam.com.",
      subject: "Pago fallido",
    },
  },
};

export function t(locale: string, key: string, params?: Record<string, string>): string {
  const msgs = mailMessages[locale] ?? mailMessages["en"];
  const val = key.split(".").reduce((acc: any, part: string) => acc?.[part], msgs);
  const template = typeof val === "string" ? val : key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}
