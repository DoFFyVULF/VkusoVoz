"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { QuantityInput } from "@/components/ui/quantity-input";
import { cn } from "@/lib/utils";
import { useCartStore, formatPrice, type CartItem } from "@/lib/store/cart";

export interface CartItemProps {
  item: CartItem;
  className?: string;
}

export function CartItemRow({ item, className }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getOptionsKey = useCartStore((s) => s.getOptionsKey);
  const optionsKey = getOptionsKey(item.options);
  const optionsDelta = item.options.reduce((s, o) => s + o.priceDelta, 0);
  const unitPrice = item.price + optionsDelta;
  const total = unitPrice * item.quantity;

  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border bg-card p-4 shadow-sm shadow-black/[0.04]",
        className
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Нет фото</div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{item.name}</h3>
          <button
            type="button"
            aria-label={`Удалить ${item.name}`}
            onClick={() => removeItem(item.dishId, optionsKey)}
            className="inline-flex size-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        {item.options.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Выбранные опции">
            {item.options.map((opt) => (
              <li
                key={opt.itemId}
                className="inline-flex items-center rounded-full border bg-warm px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {opt.name}
                {opt.priceDelta > 0 && <span className="ml-1 text-foreground">+{formatPrice(opt.priceDelta)}</span>}
              </li>
            ))}
          </ul>
        )}

        {item.comment && (
          <p className="rounded-lg bg-warm px-2.5 py-1.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Комментарий:</span> {item.comment}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <QuantityInput
            value={item.quantity}
            onChange={(v) => updateQuantity(item.dishId, optionsKey, v)}
            min={1}
            max={20}
            ariaLabel={`Количество ${item.name}`}
          />
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold tabular-nums text-foreground">{formatPrice(total)}</span>
            {item.quantity > 1 && (
              <span className="text-xs tabular-nums text-muted-foreground">{formatPrice(unitPrice)} / шт</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CartItemRow as CartItem };
