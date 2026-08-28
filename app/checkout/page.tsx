"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, Store, Clock3, CalendarClock, CreditCard, Banknote, MapPin, Phone, Mail, User, Ticket, Check, X, ChevronRight, Lock } from "lucide-react";
import { useCartStore, formatPrice } from "@/lib/store/cart";
import { useDeliveryStore } from "@/lib/store/delivery";
import { useAuth } from "@/lib/hooks/useAuth";
import { restaurantsMock } from "@/lib/mock-data";

function resolveRestaurantName(restaurantId: string, fallback: string | undefined): string {
  if (fallback && fallback !== restaurantId) return fallback;
  const found = restaurantsMock.find((r) => r.slug === restaurantId || r.id === restaurantId);
  return found?.name ?? fallback ?? restaurantId;
}
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 199;
const FREE_DELIVERY_THRESHOLD = 1500;

const SAVED_ADDRESSES = [
  { id: "1", label: "Дом", city: "Москва", street: "Тверская", house: "9", apartment: "12" },
  { id: "2", label: "Работа", city: "Москва", street: "Арбат", house: "25", apartment: "4" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryMode = useDeliveryStore((s) => s.mode);
  const setDeliveryMode = useDeliveryStore((s) => s.setMode);
  const [promoState, setPromoState] = React.useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [promoMessage, setPromoMessage] = React.useState<string | undefined>(undefined);
  const [discount, setDiscount] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const baseDeliveryFee = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const deliveryFee = deliveryMode === "pickup" ? 0 : baseDeliveryFee;
  // Pre-compute groups + per-restaurant delivery/discount so OrderSummary can render split totals
  const groups = React.useMemo(() => {
    const map = new Map<string, { restaurantId: string; restaurantName: string; items: typeof items; subtotal: number; itemCount: number }>();
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
  }, [items]);

  const perRestaurantDelivery = React.useMemo(() => {
    if (deliveryMode === "pickup") {
      return Object.fromEntries(groups.map((g) => [g.restaurantId, 0]));
    }
    return Object.fromEntries(
      groups.map((g) => [g.restaurantId, g.subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE])
    );
  }, [groups, deliveryMode]);

  const perRestaurantDiscount = React.useMemo(() => {
    if (subtotal <= 0 || discount <= 0) return {};
    return Object.fromEntries(
      groups.map((g) => [g.restaurantId, Math.round((discount * g.subtotal) / subtotal)])
    );
  }, [groups, discount, subtotal]);

  const splitTotal = React.useMemo(
    () =>
      groups.reduce(
        (s, g) =>
          s +
          Math.max(
            0,
            g.subtotal + (perRestaurantDelivery[g.restaurantId] ?? 0) - (perRestaurantDiscount[g.restaurantId] ?? 0)
          ),
        0
      ),
    [groups, perRestaurantDelivery, perRestaurantDiscount]
  );
  const finalTotal = splitTotal;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fulfillmentType: deliveryMode,
      timeType: "asap",
      scheduledTime: "",
      paymentMethod: "online",
      contact: { name: "", phone: "", email: "" },
      address: { city: "Москва", street: "", house: "", apartment: "", entrance: "", floor: "", intercom: "", comment: "", savedAddressId: "" },
      comment: "",
      promoCode: "",
    },
    mode: "onBlur",
  });

  const fulfillmentType = form.watch("fulfillmentType");
  const timeType = form.watch("timeType");
  const promoCodeWatch = form.watch("promoCode") ?? "";

  React.useEffect(() => {
    if (mounted && deliveryMode !== form.getValues("fulfillmentType")) {
      form.setValue("fulfillmentType", deliveryMode, { shouldValidate: true });
    }
  }, [deliveryMode, mounted, form]);

  const handleApplyPromo = () => {
    if (!isAuthenticated) {
      setPromoState("invalid");
      setPromoMessage("Войдите, чтобы применить промокод");
      return;
    }
    const code = promoCodeWatch.trim().toUpperCase();
    if (!code) return;
    setPromoState("loading");
    window.setTimeout(() => {
      if (code === "VKUS10") {
        const d = Math.round(subtotal * 0.1);
        setDiscount(d);
        setPromoState("valid");
        setPromoMessage(`Скидка 10% · −${formatPrice(d)}`);
      } else if (code === "HELLO500") {
        const d = Math.min(500, subtotal);
        setDiscount(d);
        setPromoState("valid");
        setPromoMessage(`Скидка ${formatPrice(d)} применена`);
      } else {
        setDiscount(0);
        setPromoState("invalid");
        setPromoMessage("Промокод не найден");
      }
    }, 600);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Group items by restaurant — each restaurant becomes a separate order.
    const groupMap = new Map<string, typeof items>();
    for (const it of items) {
      const list = groupMap.get(it.restaurantId) ?? [];
      list.push(it);
      groupMap.set(it.restaurantId, list);
    }
    const orderIds: string[] = [];
    const suffix = Date.now().toString().slice(-6);
    let i = 0;
    for (const [restaurantId, groupItems] of groupMap) {
      const id = `VK-${suffix}-${++i}`;
      orderIds.push(id);
      if (typeof window !== "undefined") {
        const groupSubtotal = groupItems.reduce(
          (s, it) =>
            s + (it.price + it.options.reduce((d, o) => d + o.priceDelta, 0)) * it.quantity,
          0
        );
        // Free delivery per-order when subtotal crosses threshold
        const groupDelivery = deliveryMode === "pickup"
          ? 0
          : groupSubtotal >= FREE_DELIVERY_THRESHOLD
            ? 0
            : DELIVERY_FEE;
        // Spread total discount proportionally to subtotal if any
        const groupDiscount = subtotal > 0
          ? Math.round((discount * groupSubtotal) / subtotal)
          : 0;
        const groupTotal = Math.max(0, groupSubtotal + groupDelivery - groupDiscount);

        sessionStorage.setItem(
          `order:${id}`,
          JSON.stringify({
            values,
            restaurantId,
            restaurantName: resolveRestaurantName(restaurantId, groupItems[0]?.restaurantName),
            items: groupItems,
            subtotal: groupSubtotal,
            deliveryFee: groupDelivery,
            discount: groupDiscount,
            total: groupTotal,
          })
        );
      }
    }

    useCartStore.getState().clear();

    // Single order -> /order/<id>, multiple -> /orders?ids=a,b,c
    if (orderIds.length === 1) {
      router.push(`/order/${orderIds[0]}`);
    } else {
      router.push(`/orders?ids=${orderIds.join(",")}`);
    }
  };

  if (!mounted) {
    return <div className="mx-auto w-full max-w-6xl px-4 py-8"><div className="h-8 w-40 animate-pulse rounded-lg bg-muted" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <EmptyState
          title="Корзина пуста"
          description="Сначала добавьте блюда в корзину, чтобы оформить заказ."
          actionLabel="В каталог"
          onAction={() => router.push("/")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <nav aria-label="Хлебные крошки" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/cart" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Корзина</Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span aria-current="page" className="font-medium text-foreground">Оформление</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Оформление заказа</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                Способ получения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="fulfillmentType"
                render={({ field }) => (
                  <div role="radiogroup" aria-label="Способ получения" className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors duration-150 motion-reduce:transition-none has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
                        field.value === "delivery" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted"
                      )}
                    >
                      <input type="radio" className="sr-only" checked={field.value === "delivery"} onChange={() => { field.onChange("delivery"); setDeliveryMode("delivery"); }} />
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", field.value === "delivery" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        <Truck className="size-5" aria-hidden="true" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">Доставка</span>
                        <span className="text-xs text-muted-foreground">30–45 мин · {formatPrice(baseDeliveryFee)}</span>
                      </span>
                    </label>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors duration-150 motion-reduce:transition-none has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
                        field.value === "pickup" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted"
                      )}
                    >
                      <input type="radio" className="sr-only" checked={field.value === "pickup"} onChange={() => { field.onChange("pickup"); setDeliveryMode("pickup"); }} />
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", field.value === "pickup" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        <Store className="size-5" aria-hidden="true" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">Самовывоз</span>
                        <span className="text-xs text-muted-foreground">Бесплатно · 15–20 мин</span>
                      </span>
                    </label>
                  </div>
                )}
              />
              {form.formState.errors.fulfillmentType && (
                <p role="alert" className="mt-2 text-xs font-medium text-destructive">{form.formState.errors.fulfillmentType.message}</p>
              )}
            </CardContent>
          </Card>

          {fulfillmentType === "delivery" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  Адрес доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isAuthenticated ? (
                  <div className="flex flex-wrap gap-2" aria-label="Сохранённые адреса">
                    {SAVED_ADDRESSES.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          form.setValue("address.city", a.city);
                          form.setValue("address.street", a.street);
                          form.setValue("address.house", a.house);
                          form.setValue("address.apartment", a.apartment);
                          form.setValue("address.savedAddressId", a.id);
                        }}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border bg-card px-4 text-sm font-medium hover:bg-muted transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <MapPin className="size-3.5" aria-hidden="true" /> {a.label}: {a.street}, {a.house}
                      </button>
                    ))}
                  </div>
                ) : (
                  !isAuthLoading && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-snug text-amber-800">
                      <Lock className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-xs font-medium">Сохранённые адреса доступны после входа</span>
                        <Link
                          href="/auth/login?next=/checkout"
                          className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                          Войти
                        </Link>
                      </div>
                    </div>
                  )
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Город" required placeholder="Москва" error={form.formState.errors.address?.city?.message} {...form.register("address.city")} />
                  <Input label="Улица" required placeholder="Тверская" error={form.formState.errors.address?.street?.message} {...form.register("address.street")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Дом" required placeholder="9" error={form.formState.errors.address?.house?.message} {...form.register("address.house")} />
                  <Input label="Квартира" placeholder="12" error={form.formState.errors.address?.apartment?.message} {...form.register("address.apartment")} />
                  <Input label="Подъезд" placeholder="2" {...form.register("address.entrance")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Этаж" placeholder="5" {...form.register("address.floor")} />
                  <Input label="Домофон" placeholder="12К" {...form.register("address.intercom")} />
                  <Input label="Комментарий курьеру" placeholder="Код двери, ориентир" {...form.register("address.comment")} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{fulfillmentType === "delivery" ? "3" : "2"}</span>
                Время
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Controller
                control={form.control}
                name="timeType"
                render={({ field }) => (
                  <div role="radiogroup" aria-label="Время доставки" className="grid gap-3 sm:grid-cols-2">
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors duration-150 motion-reduce:transition-none", field.value === "asap" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted")}>
                      <input type="radio" className="sr-only" checked={field.value === "asap"} onChange={() => field.onChange("asap")} />
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", field.value === "asap" ? "bg-primary text-primary-foreground" : "bg-muted")}><Clock3 className="size-5" aria-hidden="true" /></span>
                      <span className="text-sm font-semibold">Как можно скорее</span>
                    </label>
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors duration-150 motion-reduce:transition-none", field.value === "scheduled" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted")}>
                      <input type="radio" className="sr-only" checked={field.value === "scheduled"} onChange={() => field.onChange("scheduled")} />
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", field.value === "scheduled" ? "bg-primary text-primary-foreground" : "bg-muted")}><CalendarClock className="size-5" aria-hidden="true" /></span>
                      <span className="text-sm font-semibold">Ко времени</span>
                    </label>
                  </div>
                )}
              />
              {timeType === "scheduled" && (
                <div className="pt-1">
                  <Input
                    label="Дата и время"
                    type="datetime-local"
                    error={form.formState.errors.scheduledTime?.message}
                    {...form.register("scheduledTime")}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">Не раньше чем через 30 минут от текущего времени</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{fulfillmentType === "delivery" ? "4" : "3"}</span>
                Контакты
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input label="Имя" required placeholder="Алексей" error={form.formState.errors.contact?.name?.message} {...form.register("contact.name")} />
              <Controller
                control={form.control}
                name="contact.phone"
                render={({ field, fieldState }) => (
                  <PhoneInput
                    label="Телефон"
                    required
                    placeholder="+7 (999) 123-45-67"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    name={field.name}
                  />
                )}
              />
              <div className="sm:col-span-2">
                <Input label="Email (для чека)" type="email" placeholder="you@example.com" error={form.formState.errors.contact?.email?.message} {...form.register("contact.email")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{fulfillmentType === "delivery" ? "5" : "4"}</span>
                Оплата
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <div role="radiogroup" aria-label="Способ оплаты" className="grid gap-3 sm:grid-cols-2">
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors duration-150 motion-reduce:transition-none", field.value === "online" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted")}>
                      <input type="radio" className="sr-only" checked={field.value === "online"} onChange={() => field.onChange("online")} />
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", field.value === "online" ? "bg-primary text-primary-foreground" : "bg-muted")}><CreditCard className="size-5" aria-hidden="true" /></span>
                      <span className="flex flex-col"><span className="text-sm font-semibold">Онлайн картой</span><span className="text-xs text-muted-foreground">Картой, СБП</span></span>
                    </label>
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors duration-150 motion-reduce:transition-none", field.value === "cash" ? "border-primary bg-primary/5" : "bg-card hover:bg-muted")}>
                      <input type="radio" className="sr-only" checked={field.value === "cash"} onChange={() => field.onChange("cash")} />
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", field.value === "cash" ? "bg-primary text-primary-foreground" : "bg-muted")}><Banknote className="size-5" aria-hidden="true" /></span>
                      <span className="flex flex-col"><span className="text-sm font-semibold">При получении</span><span className="text-xs text-muted-foreground">Наличными / картой курьеру</span></span>
                    </label>
                  </div>
                )}
              />
              {form.formState.errors.paymentMethod && (
                <p role="alert" className="text-xs font-medium text-destructive">{form.formState.errors.paymentMethod.message}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Комментарий к заказу</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea label="Комментарий" placeholder="Пожелания к заказу, аллергены..." rows={3} maxLength={500} error={form.formState.errors.comment?.message} {...form.register("comment")} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <label htmlFor="checkout-promo" className="text-sm font-medium flex items-center gap-2"><Ticket className="size-4" aria-hidden="true" /> Промокод</label>
              <div className="flex gap-2">
                <input
                  id="checkout-promo"
                  placeholder={!isAuthenticated && !isAuthLoading ? "Войдите, чтобы применить промокод" : "VKUS10"}
                  disabled={!isAuthenticated && !isAuthLoading}
                  {...form.register("promoCode")}
                  aria-invalid={promoState === "invalid"}
                  className={cn(
                    "flex h-11 min-h-11 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                    promoState === "invalid" && "border-destructive focus-visible:ring-destructive",
                    promoState === "valid" && "border-success focus-visible:ring-success"
                  )}
                />
                {promoState === "valid" && isAuthenticated ? (
                  <Button type="button" variant="outline" onClick={() => { setPromoState("idle"); setPromoMessage(undefined); setDiscount(0); form.setValue("promoCode",""); }}>
                    <X className="size-4" /> Убрать
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" loading={promoState==="loading"} onClick={handleApplyPromo} disabled={(!isAuthenticated && !isAuthLoading) || !promoCodeWatch.trim()}>
                    Применить
                  </Button>
                )}
              </div>
              {!isAuthenticated && !isAuthLoading ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-snug text-amber-800">
                  <Lock className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-xs font-medium">Промокод доступен только для авторизованных пользователей</span>
                    <Link href="/auth/login?next=/checkout" className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Войти</Link>
                  </div>
                </div>
              ) : (
                promoMessage && (
                  <p role={promoState==="invalid"?"alert":"status"} aria-live="polite" className={cn("flex items-center gap-1.5 text-xs font-medium", promoState==="valid"&&"text-success", promoState==="invalid"&&"text-destructive")}>
                    {promoState==="valid"?<Check className="size-3.5" />: <X className="size-3.5" />} {promoMessage}
                  </p>
                )
              )}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" loading={isSubmitting} className="w-full lg:hidden">
            Оформить · {formatPrice(finalTotal)}
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryFee={fulfillmentType === "pickup" ? 0 : deliveryFee}
            discount={discount}
            total={finalTotal}
            groups={groups}
            perRestaurantDelivery={perRestaurantDelivery}
            perRestaurantDiscount={perRestaurantDiscount}
          />
          <Button type="submit" size="lg" loading={isSubmitting} className="hidden w-full lg:inline-flex">
            Оформить · {formatPrice(finalTotal)}
          </Button>
          <p className="hidden text-center text-xs leading-relaxed text-muted-foreground lg:block">Оформляя заказ, вы соглашаетесь с офертой и политикой обработки данных</p>
        </div>
      </form>
    </div>
  );
}
