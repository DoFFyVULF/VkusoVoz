"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, Store, Clock } from "lucide-react";
import { useCartStore, formatPrice, type RestaurantGroup } from "@/lib/store/cart";
import { useDeliveryStore } from "@/lib/store/delivery";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHours } from "@/lib/hooks/useHours";
import { getRestaurantScheduleBySlug, restaurantsMock } from "@/lib/mock-data";

function resolveRestaurantName(restaurantId: string, fallback: string | undefined): string {
  if (fallback && fallback !== restaurantId) return fallback;
  const found = restaurantsMock.find((r) => r.slug === restaurantId || r.id === restaurantId);
  return found?.name ?? fallback ?? restaurantId;
}
import { CartItemRow } from "@/components/cart/cart-item";
import { CartSummary, type PromoState } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DELIVERY_FEE = 199;
const FREE_DELIVERY_THRESHOLD = 1500;
const MIN_ORDER_PER_RESTAURANT = 600;

/** Мягкое предупреждение: ресторан сейчас закрыт, но заказ принять можно — начнут готовить после открытия. */
function ClosedHoursNotice({ restaurantId }: { restaurantId: string }) {
  const schedule = React.useMemo(() => getRestaurantScheduleBySlug(restaurantId), [restaurantId]);
  const hours = useHours(schedule);
  if (hours.isOpen) return null;
  return (
    <div
      className="flex items-start gap-2 border-b bg-warning/5 px-4 py-2.5 text-xs text-warning-foreground"
      role="status"
      aria-live="polite"
    >
      <Clock className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
      <p className="leading-snug">
        <span className="font-semibold text-foreground">Начнём готовить после открытия.</span>{" "}
        <span className="text-muted-foreground">{hours.statusLabel}</span>
      </p>
    </div>
  );
}

const VALID_PROMOS: Record<string, number> = {
  VKUS10: 10,
  HELLO500: 500,
  SALE15: 15,
};

function RestaurantGroupCard({
  group,
  onClearGroup,
}: {
  group: RestaurantGroup;
  onClearGroup: (id: string, name: string) => void;
}) {
  const belowMin = group.subtotal < MIN_ORDER_PER_RESTAURANT;
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Store className="size-3.5" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">{group.restaurantName}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {group.itemCount} {group.itemCount === 1 ? "блюдо" : "блюд"} · {formatPrice(group.subtotal)}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onClearGroup(group.restaurantId, group.restaurantName)}
          className="text-muted-foreground"
          aria-label={`Удалить все блюда из ресторана ${group.restaurantName}`}
        >
          <Trash2 className="size-3.5" aria-hidden="true" /> Очистить
        </Button>
      </div>
      <div className="flex flex-col">
        {group.items.map((item) => (
          <CartItemRow
            key={`${item.restaurantId}-${item.dishId}-${item.options.map((o) => o.itemId).join(",")}`}
            item={item}
          />
        ))}
      </div>
      <ClosedHoursNotice restaurantId={group.restaurantId} />
      {belowMin && (
        <p className="border-t bg-warning/5 px-4 py-2 text-xs text-warning" role="alert">
          До минимальной суммы {formatPrice(MIN_ORDER_PER_RESTAURANT)} не хватает{" "}
          {formatPrice(MIN_ORDER_PER_RESTAURANT - group.subtotal)} — добавьте что-нибудь или оформите этот ресторан отдельно.
        </p>
      )}
    </Card>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const clearRestaurant = useCartStore((s) => s.clearRestaurant);
  const totalQuantity = useCartStore((s) => s.totalQuantity());

  const [promoCode, setPromoCode] = React.useState("");
  const [promoState, setPromoState] = React.useState<PromoState>("idle");
  const [promoMessage, setPromoMessage] = React.useState<string | undefined>(undefined);
  const [discount, setDiscount] = React.useState(0);
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const [clearGroup, setClearGroup] = React.useState<{ id: string; name: string } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const deliveryMode = useDeliveryStore((s) => s.mode);
  const setDeliveryMode = useDeliveryStore((s) => s.setMode);

  React.useEffect(() => setMounted(true), []);

  const groups: RestaurantGroup[] = React.useMemo(() => {
    const map = new Map<string, RestaurantGroup>();
    for (const it of items) {
      const existing = map.get(it.restaurantId);
      if (existing) {
        existing.items.push(it);
        existing.subtotal += (it.price + it.options.reduce((s, o) => s + o.priceDelta, 0)) * it.quantity;
        existing.itemCount += it.quantity;
      } else {
        map.set(it.restaurantId, {
          restaurantId: it.restaurantId,
          restaurantName: resolveRestaurantName(it.restaurantId, it.restaurantName),
          items: [it],
          subtotal: (it.price + it.options.reduce((s, o) => s + o.priceDelta, 0)) * it.quantity,
          itemCount: it.quantity,
        });
      }
    }
    return Array.from(map.values());
  }, [items]);

  const baseDeliveryFee = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const deliveryFee = deliveryMode === "pickup" ? 0 : baseDeliveryFee;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const allGroupsMeetMin = groups.every((g) => g.subtotal >= MIN_ORDER_PER_RESTAURANT);
  const canCheckout = items.length > 0 && allGroupsMeetMin;

  const handleApplyPromo = () => {
    if (!isAuthenticated) {
      setPromoState("invalid");
      setPromoMessage("Войдите, чтобы применить промокод");
      return;
    }
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoState("loading");
    setPromoMessage(undefined);
    window.setTimeout(() => {
      const val = VALID_PROMOS[code];
      if (val === undefined) {
        setPromoState("invalid");
        setPromoMessage("Промокод не найден или истёк");
        setDiscount(0);
      } else {
        setPromoState("valid");
        const isPercent = val <= 50;
        const d = isPercent ? Math.round(subtotal * (val / 100)) : Math.min(val, subtotal);
        setDiscount(d);
        setPromoMessage(isPercent ? `Скидка ${val}% применена` : `Скидка ${formatPrice(d)} применена`);
      }
    }, 600);
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoState("idle");
    setPromoMessage(undefined);
    setDiscount(0);
  };

  const handleCheckout = () => {
    if (!canCheckout) return;
    router.push("/checkout");
  };

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Корзина</h1>
        <EmptyState
          title="Корзина пуста"
          description="Добавьте блюда из каталога — они появятся здесь. Минимальная сумма заказа от ресторана."
          icon={<ShoppingBag className="size-8" aria-hidden="true" />}
          actionLabel="Перейти в каталог"
          onAction={() => router.push("/")}
        />
        <Card className="flex flex-col gap-3 p-6">
          <h2 className="text-sm font-semibold">Популярные категории</h2>
          <div className="flex flex-wrap gap-2">
            {["Пицца", "Суши", "Бургеры", "Wok", "Десерты"].map((c) => (
              <Link
                key={c}
                href="/"
                className="rounded-full border bg-card px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {c}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          Корзина <span className="font-normal text-muted-foreground">· {totalQuantity} шт</span>
        </h1>
        <div className="flex items-center gap-2">
          {groups.length > 1 && (
            <Badge variant="muted">{groups.length} ресторана</Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="text-muted-foreground"
            aria-label="Очистить корзину"
          >
            <Trash2 className="size-4" aria-hidden="true" /> Очистить
          </Button>
        </div>
      </div>

      {groups.length > 1 && (
        <div className="mb-4 rounded-xl border bg-warm px-4 py-3 text-sm">
          <p className="leading-relaxed">
            <span className="font-medium">Несколько ресторанов.</span> Каждый ресторан будет оформлен как
            отдельный заказ. Доставка и скидки применяются к каждому заказу независимо.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-xs font-medium">
              {deliveryMode === "pickup" ? "Самовывоз · 15-20 мин · бесплатно" : "Доставка · 30-45 мин"}
            </span>
            <button
              type="button"
              onClick={() => setDeliveryMode(deliveryMode === "pickup" ? "delivery" : "pickup")}
              className="inline-flex h-7 items-center rounded-full border bg-muted px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {deliveryMode === "pickup" ? "Переключить на доставку" : "Переключить на самовывоз"}
            </button>
          </div>
          {groups.map((group) => (
            <RestaurantGroupCard
              key={group.restaurantId}
              group={group}
              onClearGroup={(id, name) => setClearGroup({ id, name })}
            />
          ))}
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border bg-card px-6 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Добавить ещё блюда
          </Link>
        </div>

        <div className="hidden lg:block lg:sticky lg:top-6">
          <CartSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            discount={discount}
            total={total}
            minOrderAmount={0}
            promoCode={promoCode}
            onPromoCodeChange={(v) => {
              setPromoCode(v);
              if (promoState !== "idle") {
                setPromoState("idle");
                setPromoMessage(undefined);
              }
            }}
            promoState={promoState}
            promoMessage={promoMessage}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
            onCheckout={handleCheckout}
            itemsCount={totalQuantity}
            isAuthenticated={isAuthenticated}
            isAuthLoading={isAuthLoading}
            canCheckout={canCheckout}
            checkoutHint={
              !allGroupsMeetMin
                ? "В каждом ресторане должна быть минимальная сумма"
                : undefined
            }
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Итого · {totalQuantity} шт · {formatPrice(total)}</span>
            <span className="text-base font-bold tabular-nums">{formatPrice(total)}</span>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={handleCheckout}
            disabled={!canCheckout}
            className="shrink-0"
          >
            Оформить
          </Button>
        </div>
        {!canCheckout && (
          <p className="mt-2 text-center text-xs text-warning" role="alert">
            В каждом ресторане должна быть минимальная сумма ({formatPrice(MIN_ORDER_PER_RESTAURANT)})
          </p>
        )}
      </div>

      <div className="mt-6 lg:hidden">
        <CartSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          discount={discount}
          total={total}
          minOrderAmount={0}
          promoCode={promoCode}
          onPromoCodeChange={(v) => {
            setPromoCode(v);
            if (promoState !== "idle") {
              setPromoState("idle");
              setPromoMessage(undefined);
            }
          }}
          promoState={promoState}
          promoMessage={promoMessage}
          onApplyPromo={handleApplyPromo}
          onRemovePromo={handleRemovePromo}
          onCheckout={handleCheckout}
          itemsCount={totalQuantity}
          isAuthenticated={isAuthenticated}
          isAuthLoading={isAuthLoading}
          canCheckout={canCheckout}
        />
      </div>

      <Modal open={showClearConfirm} onOpenChange={setShowClearConfirm} title="Очистить корзину?">
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Все блюда из всех ресторанов будут удалены. Это действие нельзя отменить.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="flex-1">
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                clear();
                setShowClearConfirm(false);
                handleRemovePromo();
              }}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Очистить
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!clearGroup}
        onOpenChange={(o) => !o && setClearGroup(null)}
        title="Удалить блюда ресторана?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Все блюда из «{clearGroup?.name}» будут удалены из корзины. Блюда других ресторанов останутся.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setClearGroup(null)} className="flex-1">
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (clearGroup) clearRestaurant(clearGroup.id);
                setClearGroup(null);
              }}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
