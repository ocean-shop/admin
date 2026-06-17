export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number; // Optional duration in ms. If 0, it doesn't auto-dismiss.
}

export type ToastOptions = Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>;
