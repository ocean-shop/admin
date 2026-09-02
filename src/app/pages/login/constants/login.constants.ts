export {
  VIEW_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
  IDENTITY_STORAGE_KEY,
} from '../../../core/constants/auth.constant';

export const IDENTITY_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]+|\d{10})$/;
export const OTP_PATTERN = /^\d{4}$/;

export const LOGIN_TEXTS = {
  page: {
    title: 'Ocean Shop',
    welcomeTitle: 'З поверненням!',
    welcomeDescription: 'Увійдіть, щоб керувати своїми запасами та замовленнями.',
  },
  toaster: {
    otpSentTitle: 'OTP надіслано',
    otpSentDescription:
      'Будь ласка, перевірте свою електронну пошту або телефон, щоб знайти одноразовий код (OTP).',
  },
  loginForm: {
    identityPlaceholder: 'Email або телефон',
    identityLabel: 'Email або телефон',
    submitButtonLabel: 'Увійти',
    requiredMessage: "Поле 'Email або телефон' є обов'язковим",
    invalidMessage: 'Введіть коректний email або 10-значний номер телефону',
  },
  otpForm: {
    otpPlaceholder: 'Введіть OTP код',
    otpLabel: 'Введіть OTP код',
    timerPrefix: 'Повторне надсилання коду через',
    submitButtonLabel: 'Підтвердити код',
    resendButtonLabel: 'Надіслати код повторно',
    backButtonLabel: 'Назад до входу',
    requiredMessage: "Поле 'OTP коду' є обов'язковим",
    invalidMessage: 'Введіть коректний 4-значний OTP код',
  },
} as const;

export const FIVE_MINUTES = 300000;
