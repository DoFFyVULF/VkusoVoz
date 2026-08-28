"use client";

import * as React from "react";
import Image from "next/image";
import { Clock, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice, type CartItem, type RestaurantGroup } from "@/lib/store/cart";
import { restaurantsMock } from "@/lib/mock-data";
import { RestaurantHeader } from "@/components/order/restaurant-header";

export interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  className?: string;
  groups?: RestaurantGroup[];
  perRestaurantDelivery?: Record<string, number>;
  perRestaurantDiscount?: Record<string, number>;
}

/**
 * Если в корзине не заполнили `restaurantName`, подтягиваем настоящее имя
 * ресторана по его slug из мок-данных. Иначе в сводке виден сам slug («teplo-grill»),
 * а не «Тепло Гриль».
 */
function resolveRestaurantName(restaurantId: string, fallback: string | undefined): string {
  if (fallback && fallback !== restaurantId) return fallback;
  const found = restaurantsMock.find((r) => r.slug === restaurantId || r.id === restaurantId);
  return found?.name ?? fallback ?? restaurantId;
}

function defaultGroups(items: CartItem[]): RestaurantGroup[] {
  const map = new Map<string, RestaurantGroup>();
  for (const it of items) {
    const delta = it.options.reduce((s, o) => s + o.priceDelta, 0);
    const line = (it.price + delta) * it.quantity;
    const existing = map.get(it.restaurantId);
    if (existing) {
      existing.items.push(it);
      existing.subtotal += line;
      existing.itemCount += it.quantity;
    } else {
      map.set(it.restaurantId, {
        restaurantId: it.restaurantId,
        restaurantName: resolveRestaurantName(it.restaurantId, it.restaurantName),
        items: [it],
        subtotal: line,
        itemCount: it.quantity,
      });
    }
  }
  return Array.from(map.values());
}

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  className,
  groups: groupsProp,
  perRestaurantDelivery,
  perRestaurantDiscount,
}: OrderSummaryProps) {
  const groups = (groupsProp ?? defaultGroups(items)).map((g) => ({
    ...g,
    restaurantName: resolveRestaurantName(g.restaurantId, g.restaurantName),
  }));
  const isMulti = groups.length > 1;
  const itemQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Ваш заказ</CardTitle>
          {isMulti && <Badge variant="muted">{groups.length} ресторана</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "блюдо" : items.length < 5 ? "блюда" : "блюд"} · {itemQty} шт
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isMulti && (
          <div className="rounded-xl bg-warm p-4 text-sm">
            <p className="text-muted-foreground">
              Каждый ресторан оформляется как отдельный заказ. Доставка каждого — независимо. Время зависит от ресторана, обычно 30–45 мин.
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {groups.map((g) => {
                const gFee = perRestaurantDelivery?.[g.restaurantId] ?? 0;
                return (
                  <div key={g.restaurantId} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-4 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <Store className="size-2.5" />
                      </span>
                      {g.restaurantName}
                    </span>
                    <span className="tabular-nums">
                      {gFee === 0 ? "Бесплатно" : formatPrice(gFee)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-5">
          {groups.map((group, idx) => {
            const groupDelivery = perRestaurantDelivery?.[group.restaurantId] ?? 0;
            const groupDiscount = perRestaurantDiscount?.[group.restaurantId] ?? 0;
            const groupTotal = Math.max(0, group.subtotal + groupDelivery - groupDiscount);
            return (
              <div key={group.restaurantId} className="flex flex-col gap-3">
                <RestaurantHeader
                  name={group.restaurantName}
                  subtitle={group.items[0]?.comment}
                  total={group.subtotal}
                  itemCount={group.itemCount}
                  variant="detailed"
                />
                <ul
                  className={cn(
                    "flex flex-col",
                    idx < groups.length - 1 && "border-b border-dashed border-border/60 pb-3"
                  )}
                  aria-label={`Блюда из ${group.restaurantName}`}
                >
                  {group.items.map((item) => {
                    const delta = item.options.reduce((s, o) => s + o.priceDelta, 0);
                    const unit = item.price + delta;
                    return (
                      <li
                        key={`${item.dishId}-${item.options.map((o) => o.itemId).join(",")}`}
                        className="flex gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              Фото
                            </div>
                          )}
                          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium leading-tight">
                            {item.name}
                          </p>
                          {item.options.length > 0 && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {item.options.map((o) => o.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatPrice(unit * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {isMulti && (
                  <div className="flex flex-col gap-1 rounded-lg bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Доставка заказа</span>
                      <span className="tabular-nums">
                        {groupDelivery === 0 ? "Бесплатно" : formatPrice(groupDelivery)}
                      </span>
                    </div>
                    {groupDiscount > 0 && (
                      <div className="flex items-center justify-between text-success">
                        <span>Скидка</span>
                        <span className="tabular-nums">−{formatPrice(groupDiscount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>Итого по заказу</span>
                      <span className="tabular-nums">{formatPrice(groupTotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-warm p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Товары</span>
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
            <span className="font-semibold">Итого к оплате</span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Время доставки 30–45 мин. Курьер позвонит за 5 минут до прибытия.
        </p>
      </CardContent>
    </Card>
  );
}
