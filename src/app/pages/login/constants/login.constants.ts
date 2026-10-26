/** Email, or a Ukrainian phone as the API accepts it: +380XXXXXXXXX, 380XXXXXXXXX or 0XXXXXXXXX. */
export const LOGIN_IDENTITY_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]+|(\+380|380|0)\d{9})$/;
export const LOGIN_OTP_PATTERN = /^\d{4}$/;

/** Matches the API's default `OTP_EXPIRE`; a new code can be requested only after it. */
export const LOGIN_OTP_LIFETIME_MS = 5 * 60 * 1000;
/** How long the form stays disabled after the API answers 429. */
export const LOGIN_THROTTLE_COOLDOWN_MS = 60 * 1000;
export const LOGIN_TIMER_TICK_MS = 1000;
export const LOGIN_MS_PER_SECOND = 1000;
export const LOGIN_SECONDS_PER_MINUTE = 60;

export const LOGIN_TEXTS = {
  PAGE: {
    TITLE: 'Ocean Shop',
    WELCOME_TITLE: 'З поверненням!',
    WELCOME_DESCRIPTION: 'Увійдіть, щоб керувати своїми запасами та замовленнями.',
  },
  TOASTER: {
    OTP_SENT_TITLE: 'OTP надіслано',
    OTP_SENT_DESCRIPTION:
      'Будь ласка, перевірте свою електронну пошту або телефон, щоб знайти одноразовий код (OTP).',
  },
  LOGIN_FORM: {
    IDENTITY_PLACEHOLDER: 'Email або телефон',
    IDENTITY_LABEL: 'Email або телефон',
    SUBMIT_BUTTON_LABEL: 'Увійти',
    REQUIRED_MESSAGE: "Поле 'Email або телефон' є обов'язковим",
    INVALID_MESSAGE:
      'Введіть коректний email або номер телефону у форматі +380XXXXXXXXX чи 0XXXXXXXXX',
  },
  OTP_FORM: {
    OTP_PLACEHOLDER: 'Введіть OTP код',
    OTP_LABEL: 'Введіть OTP код',
    TIMER_PREFIX: 'Повторне надсилання коду через',
    SUBMIT_BUTTON_LABEL: 'Підтвердити код',
    RESEND_BUTTON_LABEL: 'Надіслати код повторно',
    BACK_BUTTON_LABEL: 'Назад до входу',
    REQUIRED_MESSAGE: "Поле 'OTP коду' є обов'язковим",
    INVALID_MESSAGE: 'Введіть коректний 4-значний OTP код',
  },
} as const;
