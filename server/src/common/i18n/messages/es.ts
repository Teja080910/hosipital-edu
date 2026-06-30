const es = {
  "auth": {
    "emailInUse": "El correo electrónico ya está en uso",
    "emailNotFound": "Correo electrónico no encontrado",
    "incorrectPassword": "Contraseña incorrecta",
    "invalidCredentials": "Credenciales inválidas",
    "accountMigrated": "Tu cuenta fue migrada. Revisa tu correo para establecer una nueva contraseña.",
    "userNotFound": "Usuario no encontrado",
    "invalidToken": "Token inválido",
    "tokenExpired": "Token inválido o expirado",
    "emailVerified": "Correo verificado exitosamente",
    "emailAlreadyVerified": "El correo ya está verificado",
    "verificationSent": "Correo de verificación enviado",
    "ifEmailExists": "Si el correo existe, se ha enviado un enlace de verificación",
    "passwordResetSent": "Correo de restablecimiento de contraseña enviado",
    "ifEmailExistsReset": "Si el correo existe, se ha enviado un enlace de restablecimiento",
    "passwordResetSuccess": "Contraseña restablecida exitosamente",
    "loggedOut": "Sesión cerrada exitosamente",
    "accessDenied": "Acceso denegado",
    "tempEmailNotAllowed": "No se permiten direcciones de correo temporales. Usa un correo electrónico válido.",
    "emailNotVerified": "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación."
  },
  "users": {
    "notFound": "Usuario no encontrado",
    "deleted": "Usuario eliminado",
    "accessDenied": "Acceso denegado"
  },
  "courses": {
    "notFound": "Curso no encontrado",
    "deleted": "Curso eliminado",
    "alreadyEnrolled": "Ya estás inscrito en este curso",
    "paymentRequired": "Se requiere pago para este curso",
    "moduleNotFound": "Módulo no encontrado",
    "moduleDeleted": "Módulo eliminado",
    "lessonNotFound": "Lección no encontrada",
    "lessonDeleted": "Lección eliminada",
    "commentNotFound": "Comentario no encontrado",
    "notYourComment": "No es tu comentario",
    "commentDeleted": "Comentario eliminado",
    "progressNotFound": "Registro de progreso no encontrado",
    "quizNotFound": "Cuestionario no encontrado",
    "quizAlreadyPassed": "Cuestionario ya aprobado",
    "quizAttemptNotFound": "Intento de cuestionario no encontrado",
    "quizAlreadySubmitted": "Cuestionario ya enviado"
  },
  "questions": {
    "notFound": "Pregunta no encontrada",
    "deleted": "Pregunta eliminada"
  },
  "exams": {
    "notFound": "Examen no encontrado",
    "attemptNotFound": "Intento no encontrado",
    "noActiveSubscription": "No se encontró una suscripción activa.",
    "planOnlyCourses": "Tu plan solo otorga acceso a cursos, no a exámenes.",
    "subscriptionNotIncludeExam": "Tu suscripción no incluye este tipo de examen.",
    "noRemainingAttempts": "No tienes intentos de examen restantes. Mejora tu plan.",
    "usageLimitExceeded": "Has excedido el límite de uso total de tu plan.",
    "planExpired": "La duración de tu plan ha expirado."
  },
  "flashcards": {
    "notFound": "Tarjeta de estudio no encontrada",
    "deleted": "Tarjeta de estudio eliminada",
    "noRemainingAttempts": "No tienes intentos de tarjetas restantes. Mejora tu plan."
  },
  "subscriptions": {
    "planNotFound": "Plan no encontrado",
    "noActiveSubscription": "Sin suscripción activa",
    "descriptionTemplate": "{name} - {interval}"
  },
  "articles": {
    "notFound": "Artículo no encontrado",
    "deleted": "Artículo eliminado",
    "slugExists": "Ya existe un artículo con este slug"
  },
  "certificates": {
    "notFound": "Certificado no encontrado o inválido",
    "noDefaultTemplate": "No se encontró una plantilla de certificado predeterminada",
    "courseNotFound": "Curso no encontrado",
    "userNotFound": "Usuario no encontrado"
  },
  "parameters": {
    "notFound": "Parámetro no encontrado",
    "deleted": "Parámetro eliminado"
  },
  "translations": {
    "duplicateKey": "Ya existe una traducción con esta clave y locale",
    "autoTranslateDone": "Auto-traducción de {source} a {target} completada"
  },
  "guard": {
    "notAuthenticated": "Autenticación requerida",
    "subscriptionExamDenied": "Tu suscripción no incluye acceso a este examen.",
    "accountTypeDenied": "Tu tipo de cuenta no tiene acceso a este recurso."
  },
  "common": {
    "internalError": "Error interno del servidor",
    "eventDeleted": "Evento eliminado",
    "mailNotConfigured": "Correo no configurado - omitiendo envío"
  },
  "stream": {
    "failedListVideos": "Error al listar videos",
    "videoNotFound": "Video no encontrado",
    "failedDeleteVideo": "Error al eliminar video",
    "failedGenerateToken": "Error al generar token",
    "failedGenerateUploadUrl": "Error al generar URL de subida"
  },
  "email": {
    "subjects": {
      "verifyEmail": "Verifica tu dirección de correo",
      "welcome": "¡Bienvenido a MD Exams!",
      "passwordReset": "Restablece tu contraseña",
      "passwordChanged": "Tu contraseña ha sido cambiada",
      "subscriptionConfirmed": "Suscripción confirmada",
      "subscriptionCancelled": "Suscripción cancelada",
      "paymentFailed": "Pago fallido"
    },
    "verifyEmail": {
      "heading": "Verifica tu dirección de correo",
      "body": "Hola {name}, gracias por crear tu cuenta de MD Exams. Verifica tu correo para desbloquear el acceso completo a nuestra plataforma de preparación de exámenes médicos.",
      "button": "Verificar Correo",
      "footer": "Este enlace expira en 24 horas. Si no creaste una cuenta en MD Exams, puedes ignorar este correo."
    },
    "welcome": {
      "heading": "¡Bienvenido a MD Exams!",
      "body1": "Hola {name}, tu correo ha sido verificado exitosamente. Ahora tienes acceso completo a todo lo que MD Exams ofrece.",
      "body2": "Comienza a explorar cursos médicos, practica con preguntas tipo examen, sigue tu progreso y prepárate con confianza.",
      "button": "Ir al Panel",
      "footer": "¿Necesitas ayuda? Contacta a nuestro equipo de soporte en support@md-exams.com."
    },
    "passwordReset": {
      "heading": "Restablece tu contraseña",
      "body": "Hola {name}, recibimos una solicitud para restablecer la contraseña de tu cuenta de MD Exams. Haz clic en el botón para crear una nueva contraseña.",
      "button": "Restablecer Contraseña",
      "footer": "Este enlace expira en 1 hora. Si no solicitaste un restablecimiento, puedes ignorar este correo &mdash; tu contraseña no cambiará."
    },
    "passwordChanged": {
      "heading": "Tu contraseña ha sido cambiada",
      "body1": "Hola {name}, la contraseña de tu cuenta de MD Exams fue cambiada exitosamente.",
      "body2": "Si hiciste este cambio, no necesitas hacer nada más. Si no cambiaste tu contraseña, contacta a nuestro equipo de soporte inmediatamente.",
      "button": "Ir al Panel",
      "footer": "¿Preguntas? Contacta a support@md-exams.com."
    },
    "subscriptionConfirmed": {
      "heading": "¡Suscripción confirmada!",
      "body1": "Hola {name}, gracias por suscribirte a MD Exams. Tu pago fue exitoso y tu cuenta ya está activa.",
      "planLabel": "Plan",
      "amountLabel": "Monto",
      "billingLabel": "Facturación",
      "body2": "Ahora tienes acceso ilimitado a todos los cursos, preguntas de práctica, tarjetas de estudio, simuladores de examen y análisis detallados.",
      "button": "Comenzar a Aprender",
      "footer": "¿Necesitas ayuda? Responde a este correo o contacta a support@md-exams.com."
    },
    "subscriptionCancelled": {
      "heading": "Suscripción cancelada",
      "body1": "Hola {name}, tu suscripción de MD Exams ha sido cancelada. Seguirás teniendo acceso hasta el final de tu período de facturación actual.",
      "body2": "Nos encantaría tenerte de vuelta cuando estés listo. Tu progreso y datos se conservarán.",
      "button": "Volver a Suscribirse",
      "footer": "Si cancelaste por error, puedes volver a suscribirte en cualquier momento."
    },
    "paymentFailed": {
      "heading": "Pago fallido",
      "body1": "Hola {name}, no pudimos procesar tu último pago de suscripción. No te preocupes &mdash; lo intentaremos de nuevo en unos días.",
      "body2": "Para evitar cualquier interrupción en tu acceso, actualiza tu método de pago lo antes posible.",
      "button": "Actualizar Método de Pago",
      "footer": "Si necesitas ayuda, contacta a support@md-exams.com."
    }
  }
} as const;

export default es;
