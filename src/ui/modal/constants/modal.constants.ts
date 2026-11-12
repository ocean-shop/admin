import { ModalSize } from '../models/modal-size.type';

export const MODAL_TEXTS = {
  LOADING_LABEL: 'Зачекайте...',
  CANCEL_LABEL: 'Скасувати',
  CLOSE_LABEL: 'Закрити вікно',
} as const;

export const MODAL_DEFAULT_SIZE: ModalSize = 'md';
export const MODAL_DANGER_ICON = 'delete';
export const MODAL_CLOSE_ICON = 'close';
