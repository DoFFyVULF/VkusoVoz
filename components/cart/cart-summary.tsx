"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Ticket, Check, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/store/cart";

export type PromoState = "idle" | "loading" | "valid" | "invalid";

export interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  minOrderAmount?: number;
  promoCode: string;
  onPromoCodeChange: (v: string) => void;
  promoState: PromoState;
  promoMessage?: string;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  onCheckout: () => void;
  checkoutDisabled?: boolean;
  canCheckout?: boolean;
  checkoutHint?: string;
  itemsCount: number;
  className?: string;
  isAuthenticated?: boolean;
  isAuthLoading?: boolean;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  discount,
  total,
  minOrderAmount = 600,
  promoCode,
  onPromoCodeChange,
  promoState,
  promoMessage,
  onApplyPromo,
  onRemovePromo,
  onCheckout,
  checkoutDisabled,
  canCheckout: canCheckoutProp,
  checkoutHint,
  itemsCount,
  className,
  isAuthenticated = true,
  isAuthLoading = false,
}: CartSummaryProps) {
  const remaining = Math.max(0, minOrderAmount - subtotal);
  const isMinReached = subtotal >= minOrderAmount || subtotal === 0;
  const internalCanCheckout = isMinReached && itemsCount > 0 && !checkoutDisabled;
  const canCheckout = canCheckoutProp ?? internalCanCheckout;
  const authLocked = !isAuthenticated && !isAuthLoading;

  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Сумма заказа</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Товары ({itemsCount})</span>
            <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Доставка</span>
            <span className={cn("font-medium tabular-nums", deliveryFee === 0 && "text-success")}>
              {deliveryFee === 0 ? "Бесплатно" : formatPrice(deliveryFee)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-success">
              <span>Скидка</span>
              <span className="font-medium tabular-nums">−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="my-1 h-px bg-border" aria-hidden="true" />
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold">Итого</span>
            <span className="text-lg font-bold tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="promo-input" className="text-sm font-medium">
            Промокод
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="promo-input"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value)}
                placeholder={authLocked ? "Войдите, чтобы применить промокод" : "Введите промокод"}
                disabled={authLocked}
                aria-invalid={promoState === "invalid"}
                aria-describedby={promoMessage ? "promo-message" : undefined}
                className={cn(
                  "flex h-11 min-h-11 w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  promoState === "invalid" && "border-destructive focus-visible:ring-destructive",
                  promoState === "valid" && "border-success focus-visible:ring-success"
                )}
              />
            </div>
            {promoState === "valid" && !authLocked ? (
              <Button type="button" variant="outline" onClick={onRemovePromo} aria-label="Удалить промокод" className="shrink-0">
                <X className="size-4" aria-hidden="true" /> Убрать
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                loading={promoState === "loading"}
                onClick={onApplyPromo}
                disabled={authLocked || !promoCode.trim() || promoState === "loading"}
                className="shrink-0"
              >
                Применить
              </Button>
            )}
          </div>
          {authLocked ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-snug text-amber-800">
              <Lock className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium">Промокод доступен только для авторизованных пользователей</span>
                <Link href="/auth/login?next=/cart" className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                  Войти
                </Link>
              </div>
            </div>
          ) : (
            promoMessage && (
              <p
                id="promo-message"
                role={promoState === "invalid" ? "alert" : "status"}
                aria-live="polite"
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  promoState === "valid" && "text-success",
                  promoState === "invalid" && "text-destructive",
                  promoState === "idle" && "text-muted-foreground"
                )}
              >
                {promoState === "valid" && <Check className="size-3.5" aria-hidden="true" />}
                {promoState === "invalid" && <X className="size-3.5" aria-hidden="true" />}
                {promoMessage}
              </p>
            )
          )}
        </div>

        {!isMinReached && (
          <div
            role="alert"
            className="flex gap-2.5 rounded-xl border border-warning/20 bg-warning/10 px-3 py-3 text-sm leading-snug text-amber-800"
          >
            <AlertCircle className="size-5 shrink-0 text-warning" aria-hidden="true" />
            <span>
              Минимальная сумма заказа {formatPrice(minOrderAmount)}. Добавьте ещё на {formatPrice(remaining)}.
            </span>
          </div>
        )}

        <Button
          type="button"
          size="lg"
          onClick={onCheckout}
          disabled={!canCheckout}
          aria-disabled={!canCheckout}
          className="w-full"
        >
          {canCheckout ? `К оформлению · ${formatPrice(total)}` : "К оформлению"}
        </Button>

        {!canCheckout && itemsCount > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            {checkoutHint
              ? checkoutHint
              : !isMinReached
                ? `До бесплатной доставки не хватает ${formatPrice(remaining)}`
                : "Корзина пуста"}
          </p>
        )}

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Нажимая «К оформлению», вы соглашаетесь с условиями доставки ВкусоВоз
        </p>
      </CardContent>
    </Card>
  );
}
