import { Toast, toastService } from "@/lib/toast";
import { useCallback } from "react";

export function useToast() {
  const show = useCallback((toast: Omit<Toast, "id">) => {
    return toastService.show(toast);
  }, []);

  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.success(title, message, options);
  }, []);

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.error(title, message, options);
  }, []);

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.warning(title, message, options);
  }, []);

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return toastService.info(title, message, options);
  }, []);

  const remove = useCallback((id: string) => {
    toastService.remove(id);
  }, []);

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
