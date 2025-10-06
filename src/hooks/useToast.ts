import { Toast, toastService } from "@/lib/toast";
import { useCallback } from "react";

/**
 * Custom hook for toast notifications
 *
 * Provides a convenient interface for showing toast notifications
 * with different types (success, error, warning, info) and management
 * capabilities (remove, clear).
 *
 * @returns {object} Toast notification methods
 */
export function useToast() {
  /**
   * Show a custom toast notification
   *
   * @param {Omit<Toast, "id">} toast - Toast configuration
   * @returns {string} Toast ID
   */
  const show = useCallback((toast: Omit<Toast, "id">) => {
    return toastService.show(toast);
  }, []);

  /**
   * Show success toast notification
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.success(title, message, options);
  }, []);

  /**
   * Show error toast notification
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.error(title, message, options);
  }, []);

  /**
   * Show warning toast notification
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.warning(title, message, options);
  }, []);

  /**
   * Show info toast notification
   *
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Partial<Toast>} options - Additional options
   * @returns {string} Toast ID
   */
  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.info(title, message, options);
  }, []);

  /**
   * Remove specific toast by ID
   *
   * @param {string} id - Toast ID to remove
   */
  const remove = useCallback((id: string) => {
    toastService.remove(id);
  }, []);

  /**
   * Clear all toast notifications
   */
  const clear = useCallback(() => {
    toastService.clear();
  }, []);

  return {
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  };
}
