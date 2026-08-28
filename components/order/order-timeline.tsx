"use client";

import * as React from "react";
import { Check, Clock, ChefHat, Package, Bike, Home, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatusKey = "created" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";

export interface TimelineStep {
  key: OrderStatusKey;
  label: string;
  description?: string;
  timestamp?: string;
  completed: boolean;
  active: boolean;
  cancelled?: boolean;
}

export interface OrderTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const icons: Record<OrderStatusKey, React.ReactNode> = {
  created: <Clock className="size-4" aria-hidden="true" />,
  confirmed: <Check className="size-4" aria-hidden="true" />,
  preparing: <ChefHat className="size-4" aria-hidden="true" />,
  ready: <Package className="size-4" aria-hidden="true" />,
  out_for_delivery: <Bike className="size-4" aria-hidden="true" />,
  delivered: <Home className="size-4" aria-hidden="true" />,
  cancelled: <XCircle className="size-4" aria-hidden="true" />,
};

export function OrderTimeline({ steps, className }: OrderTimelineProps) {
  return (
    <ol className={cn("flex flex-col", className)} aria-label="Статус заказа">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-colors",
                  step.cancelled
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : step.completed
                      ? "border-success bg-success text-success-foreground"
                      : step.active
                        ? "border-primary bg-primary text-primary-foreground animate-pulse"
                        : "border-border bg-card text-muted-foreground"
                )}
              >
                {icons[step.key]}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 w-0.5 flex-1 rounded-full",
                    step.completed ? "bg-success" : "bg-border"
                  )}
                  style={{ minHeight: 28 }}
                />
              )}
            </div>

            <div className={cn("flex flex-1 flex-col pb-6", isLast && "pb-0")}>
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  className={cn(
                    "text-sm font-semibold leading-none",
                    step.cancelled
                      ? "text-destructive"
                      : step.active
                        ? "text-primary"
                        : step.completed
                          ? "text-foreground"
                          : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.active && !step.cancelled && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Сейчас</span>
                )}
                {step.timestamp && (
                  <time dateTime={step.timestamp} className="text-xs tabular-nums text-muted-foreground">
                    {formatTime(step.timestamp)}
                  </time>
                )}
              </div>
              {step.description && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
