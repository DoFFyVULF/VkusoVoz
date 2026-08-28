"use client";

import * as React from "react";
import Image from "next/image";
import { Flame, Wheat, Scale } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuantityInput } from "@/components/ui/quantity-input";
import { Badge } from "@/components/ui/badge";
import { useCartStore, formatPrice, type CartOption } from "@/lib/store/cart";

export type DishOptionItem = {
  id: string;
  name: string;
  priceDelta: number;
  isDefault?: boolean;
};

export type DishOptionGroup = {
  id: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  items: DishOptionItem[];
};

export type DishModalData = {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  weight?: number | null;
  calories?: number | null;
  composition?: string | null;
  allergens?: string[];
  optionGroups: DishOptionGroup[];
};

export interface DishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dish: DishModalData | null;
}

function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export function DishModal({ open, onOpenChange, dish }: DishModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = React.useState(1);
  const [selected, setSelected] = React.useState<Record<string, Set<string>>>({});
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!dish) return;
    const init: Record<string, Set<string>> = {};
    dish.optionGroups.forEach((g) => {
      const defaults = g.items.filter((i) => i.isDefault).map((i) => i.id);
      if (defaults.length) init[g.id] = new Set(defaults);
      else if (g.isRequired && g.minSelect === 1 && g.maxSelect === 1 && g.items[0]) {
        init[g.id] = new Set([g.items[0].id]);
      }
    });
    setSelected(init);
    setQuantity(1);
    setComment("");
  }, [dish]);

  const toggleOption = (group: DishOptionGroup, itemId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(next[group.id] ?? []);
      const isRadio = group.maxSelect === 1;
      if (isRadio) {
        set.clear();
        set.add(itemId);
      } else {
        if (set.has(itemId)) set.delete(itemId);
        else {
          if (set.size >= group.maxSelect) return prev;
          set.add(itemId);
        }
        if (group.isRequired && set.size < group.minSelect && set.size === 0) {
        }
      }
      next[group.id] = set;
      return next;
    });
  };

  if (!dish) return null;

  const optionsDelta = dish.optionGroups.reduce((sum, g) => {
    const sel = selected[g.id];
    if (!sel) return sum;
    return sum + g.items.filter((i) => sel.has(i.id)).reduce((s, i) => s + i.priceDelta, 0);
  }, 0);
  const unitPrice = dish.price + optionsDelta;
  const totalPrice = unitPrice * quantity;

  const hasRequiredError = dish.optionGroups.some((g) => {
    if (!g.isRequired) return false;
    const count = selected[g.id]?.size ?? 0;
    return count < g.minSelect;
  });

  const handleAdd = () => {
    if (hasRequiredError) return;
    const options: CartOption[] = [];
    dish.optionGroups.forEach((g) => {
      const sel = selected[g.id];
      if (!sel) return;
      g.items.forEach((it) => {
        if (sel.has(it.id)) {
          options.push({
            groupId: g.id,
            groupName: g.name,
            itemId: it.id,
            name: it.name,
            priceDelta: it.priceDelta,
          });
        }
      });
    });
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      quantity,
      options,
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurantName,
      comment: comment.trim() || undefined,
    });
    onOpenChange(false);
  };

  const content = (
    <div className="flex flex-col gap-5">
      <div className="relative -mx-6 -mt-4 h-56 overflow-hidden bg-muted sm:rounded-t-2xl">
        {dish.image ? (
          <Image src={dish.image} alt={dish.name} fill className="object-cover" sizes="512px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Нет фото</div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-xl font-bold leading-tight">{dish.name}</h3>
        {dish.description && <p className="text-sm leading-relaxed text-muted-foreground">{dish.description}</p>}
        {dish.composition && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Состав:</span> {dish.composition}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {typeof dish.weight === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-warm px-2.5 py-1 text-xs font-medium">
              <Scale className="size-3.5" aria-hidden="true" /> {dish.weight} г
            </span>
          )}
          {typeof dish.calories === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-warm px-2.5 py-1 text-xs font-medium">
              <Flame className="size-3.5" aria-hidden="true" /> {dish.calories} ккал
            </span>
          )}
          {dish.allergens?.map((a) => (
            <Badge key={a} variant="muted" className="gap-1">
              <Wheat className="size-3" aria-hidden="true" /> {a}
            </Badge>
          ))}
        </div>
      </div>

      {dish.optionGroups.map((group) => {
        const sel = selected[group.id] ?? new Set<string>();
        const isRadio = group.maxSelect === 1;
        return (
          <fieldset key={group.id} className="flex flex-col gap-2.5 rounded-2xl border bg-warm p-4">
            <legend className="px-1 text-sm font-semibold">
              {group.name}
              {group.isRequired && <span className="ml-1 text-destructive">*</span>}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {isRadio ? "выберите 1" : `до ${group.maxSelect}`}
              </span>
            </legend>
            <div className="flex flex-col gap-2">
              {group.items.map((item) => {
                const checked = sel.has(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2.5 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring"
                  >
                    <input
                      type={isRadio ? "radio" : "checkbox"}
                      name={group.id}
                      checked={checked}
                      onChange={() => toggleOption(group, item.id)}
                      className="size-4 accent-primary"
                      aria-label={`${group.name}: ${item.name}`}
                    />
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    {item.priceDelta !== 0 && (
                      <span className="text-sm font-semibold tabular-nums">
                        {item.priceDelta > 0 ? `+${formatPrice(item.priceDelta)}` : formatPrice(item.priceDelta)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {group.isRequired && (sel.size < group.minSelect) && (
              <p role="alert" className="text-xs font-medium text-destructive">Выберите минимум {group.minSelect}</p>
            )}
          </fieldset>
        );
      })}

      <Textarea
        label="Комментарий к блюду"
        placeholder="Например, без лука, поострее..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={200}
        helperText={`${comment.length}/200`}
      />

      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <QuantityInput value={quantity} onChange={setQuantity} min={1} max={20} ariaLabel="Количество блюда" />
        <Button type="button" size="lg" onClick={handleAdd} disabled={hasRequiredError} className="flex-1">
          Добавить · {formatPrice(totalPrice)}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} title={dish.name} description={dish.description ?? undefined}>
        {content}
      </Drawer>
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={dish.name} description={dish.description ?? undefined} className="max-w-xl">
      {content}
    </Modal>
  );
}
