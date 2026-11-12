import { ToastType } from '../models/toaster.type';

export const DEFAULT_TOAST_DURATION = 5000;
export const DEFAULT_TOAST_ICON = 'info';
export const DEFAULT_TOAST_ICON_FILL = "'FILL' 0";

export const TOAST_ICONS: Record<ToastType, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'report',
};

export const TOAST_ICON_FILLS: Record<ToastType, string> = {
  info: "'FILL' 1",
  success: "'FILL' 1",
  warning: "'FILL' 1",
  danger: "'FILL' 1",
};

export const TOASTER_TEXTS = {
  CLOSE_LABEL: 'Закрити сповіщення',
} as const;

export const TOASTER_CLOSE_ICON = 'close';
