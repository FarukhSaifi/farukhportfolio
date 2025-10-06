"use client";

import { Toast, toastService, ToastType } from "@/lib/toast";
import { Button, Flex, Icon, Text } from "@/once-ui/components";
import { useEffect, useState } from "react";

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastIcon = (type: ToastType): string => {
    switch (type) {
      case "success":
        return "checkCircle";
      case "error":
        return "errorCircle";
      case "warning":
        return "warningTriangle";
      case "info":
        return "infoCircle";
      default:
        return "infoCircle";
    }
  };

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          background: "brand-alpha-weak" as const,
          border: "brand-alpha-medium" as const,
          icon: "brand-weak" as const,
          title: "brand-strong" as const,
          message: "brand-weak" as const,
        };
      case "error":
        return {
          background: "accent-alpha-weak" as const,
          border: "accent-alpha-medium" as const,
          icon: "accent-weak" as const,
          title: "accent-strong" as const,
          message: "accent-weak" as const,
        };
      case "warning":
        return {
          background: "accent-alpha-weak" as const,
          border: "accent-alpha-medium" as const,
          icon: "accent-weak" as const,
          title: "accent-strong" as const,
          message: "accent-weak" as const,
        };
      case "info":
        return {
          background: "neutral-alpha-weak" as const,
          border: "neutral-alpha-medium" as const,
          icon: "neutral-weak" as const,
          title: "neutral-strong" as const,
          message: "neutral-weak" as const,
        };
      default:
        return {
          background: "neutral-alpha-weak" as const,
          border: "neutral-alpha-medium" as const,
          icon: "neutral-weak" as const,
          title: "neutral-strong" as const,
          message: "neutral-weak" as const,
        };
    }
  };

  const colors = getToastColors(toast.type);

  return (
    <div
      style={{
        transform: isVisible && !isLeaving ? "translateX(0)" : "translateX(100%)",
        opacity: isVisible && !isLeaving ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        marginBottom: "8px",
      }}
    >
      <Flex
        padding="m"
        background={colors.background}
        border={colors.border}
        radius="m"
        gap="s"
        alignItems="flex-start"
        style={{
          minWidth: "320px",
          maxWidth: "400px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Icon name={getToastIcon(toast.type)} onBackground={colors.icon} size="s" />

        <Flex direction="column" gap="xs" flex={1}>
          <Text variant="body-default-s" onBackground={colors.title} style={{ fontWeight: 600 }}>
            {toast.title}
          </Text>
          {toast.message && (
            <Text variant="body-default-xs" onBackground={colors.message}>
              {toast.message}
            </Text>
          )}
          {toast.action && (
            <Button
              variant="secondary"
              size="s"
              onClick={toast.action.onClick}
              style={{ alignSelf: "flex-start", marginTop: "4px" }}
            >
              {toast.action.label}
            </Button>
          )}
        </Flex>

        <Button variant="secondary" size="s" onClick={handleRemove} style={{ padding: "4px", minWidth: "auto" }}>
          <Icon name="x" size="s" />
        </Button>
      </Flex>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "8px",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={(id) => toastService.remove(id)} />
      ))}
    </div>
  );
}
