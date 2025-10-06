import { UI_CONFIG } from "./constants";

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast Service
 *
 * Singleton service for managing toast notifications.
 * Provides a centralized way to show, manage, and remove toast notifications.
 */
class ToastService {
  private toasts: Toast[] = [];
  private listeners: Array<(toasts: Toast[]) => void> = [];

  /**
   * Subscribe to toast updates
   *
   * @param {Function} listener - Toast update listener
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of toast changes
   *
   * @private
   */
  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  /**
   * Generate unique toast ID
   *
   * @returns {string} Unique toast ID
   * @private
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show a toast notification
   *
   * @param {Omit<Toast, "id">} toast - Toast configuration
   * @returns {string} Toast ID
   */
  show(toast: Omit<Toast, "id">): string {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      duration: UI_CONFIG.TOAST_DURATION,
      ...toast,
    };

    this.toasts.push(newToast);
    this.notify();

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }

    return id;
  }

  /**
   * Show success toast
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  success(title: string, message?: string, options?: Partial<Toast>) {
    return this.show({
      type: "success",
      title,
      message,
      ...options,
    });
  }

  /**
   * Show error toast
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  error(title: string, message?: string, options?: Partial<Toast>) {
    return this.show({
      type: "error",
      title,
      message,
      ...options,
    });
  }

  /**
   * Show warning toast
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  warning(title: string, message?: string, options?: Partial<Toast>) {
    return this.show({
      type: "warning",
      title,
      message,
      ...options,
    });
  }

  /**
   * Show info toast
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  info(title: string, message?: string, options?: Partial<Toast>) {
    return this.show({
      type: "info",
      title,
      message,
      ...options,
    });
  }

  /**
   * Remove toast by ID
   *
   * @param {string} id - Toast ID to remove
   */
  remove(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts = [];
    this.notify();
  }

  /**
   * Get all current toasts
   *
   * @returns {Toast[]} Array of current toasts
   */
  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

export const toastService = new ToastService();
