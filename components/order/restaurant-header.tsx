"use client";

import * as React from "react";
import Image from "next/image";
import { Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/store/cart";

export interface RestaurantHeaderProps {
  name: string;
  subtitle?: string;
  image?: string | null;
  total?: number;
  itemCount?: number;
  deliveryTime?: string;
  rating?: number;
  badge?: string;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

function pluralDish(n: number) {
  if (n === 1) return "блюдо";
  if (n >= 2 && n <= 4) return "блюда";
  return "блюд";
}

function Initials({ name, size }: { name: string; size: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "size-8 rounded-lg text-xs",
    md: "size-10 rounded-xl text-[13px]",
    lg: "size-11 rounded-xl text-sm",
  } as const;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center border bg-surface font-bold text-foreground",
        sizes[size]
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Logo({
  name,
  image,
  size,
}: {
  name: string;
  image?: string | null;
  size: "sm" | "md" | "lg";
}) {
  const imgSize = size === "sm" ? 32 : size === "md" ? 40 : 44;
  const cls =
    size === "sm"
      ? "size-8 rounded-lg"
      : size === "md"
        ? "size-10 rounded-xl"
        : "size-11 rounded-xl";
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={imgSize}
        height={imgSize}
        className={cn("shrink-0 border border-border bg-surface object-cover", cls)}
      />
    );
  }
  return <Initials name={name} size={size} />;
}

export function RestaurantHeader({
  name,
  subtitle,
  image,
  total,
  itemCount,
  deliveryTime,
  rating,
  badge,
  variant = "default",
  className,
}: RestaurantHeaderProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center justify-between gap-3 px-3 py-2.5", className)}>
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo name={name} image={image} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-heading text-[13px] font-semibold leading-none tracking-tight">
              {name}
            </p>
            {subtitle ? (
              <p className="truncate text-xs leading-none text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {total !== undefined ? (
          <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(total)}</span>
        ) : null}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border/60 bg-warm/50 px-3 py-2.5",
          className
        )}
      >
        <div className="relative shrink-0">
          <Logo name={name} image={image} size="md" />
          {rating !== undefined ? (
            <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-0.5 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] font-semibold leading-none shadow-sm sm:hidden">
              <Star className="size-2.5 fill-warning text-warning" aria-hidden="true" />
              {rating}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-heading text-[15px] font-semibold leading-none tracking-tight">
              {name}
            </p>
            {badge ? (
              <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold leading-none text-foreground">
                {badge}
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-none text-muted-foreground">
            {itemCount !== undefined ? (
              <span>
                {itemCount} {pluralDish(itemCount)}
              </span>
            ) : null}
            {itemCount !== undefined && (total !== undefined || deliveryTime) ? (
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
            ) : null}
            {total !== undefined ? (
              <span className="font-semibold tabular-nums text-foreground">{formatPrice(total)}</span>
            ) : null}
            {total !== undefined && deliveryTime ? (
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
            ) : null}
            {deliveryTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3 shrink-0" aria-hidden="true" />
                {deliveryTime}
              </span>
            ) : null}
            {!itemCount && total === undefined && !deliveryTime && subtitle ? (
              <span className="truncate">{subtitle}</span>
            ) : null}
          </div>

          {subtitle && (itemCount !== undefined || total !== undefined || deliveryTime) ? (
            <p className="mt-0.5 truncate text-xs leading-none text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {rating !== undefined ? (
          <span className="hidden shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-xs font-semibold leading-none shadow-sm sm:inline-flex">
            <Star className="size-3 fill-warning text-warning" aria-hidden="true" />
            {rating}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-4 py-3.5",
        className
      )}
    >
      <div className="relative shrink-0">
        <Logo name={name} image={image} size="lg" />
        {rating !== undefined ? (
          <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-0.5 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] font-semibold leading-none shadow-sm">
            <Star className="size-2.5 fill-warning text-warning" aria-hidden="true" />
            {rating}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-heading text-[15px] font-semibold tracking-tight leading-none">
            {name}
          </p>
          {badge ? (
            <span className="shrink-0 rounded-full border border-border bg-warm px-2 py-0.5 text-[11px] font-semibold leading-none">
              {badge}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-0.5 truncate text-sm leading-none text-muted-foreground">{subtitle}</p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {itemCount !== undefined ? (
            <span>
              {itemCount} {pluralDish(itemCount)}
            </span>
          ) : null}
          {total !== undefined ? (
            <span className="font-semibold tabular-nums text-foreground">{formatPrice(total)}</span>
          ) : null}
          {deliveryTime ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              {deliveryTime}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
