"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Store, ChevronLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/store/cart";

type StoredOrder = {
  values: {
    contact: { name: string; phone: string };
    paymentMethod: string;
    fulfillmentType: string;
    address?: { city: string; street: string; house: string };
  };
  restaurantId: string;
  restaurantName?: string;
  items: Array<{ name: string; quantity: number }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export default function OrdersListPage() {
  return (
    <React.Suspense fallback={<div className="mx-auto w-full max-w-3xl px-4 py-8"><div className="h-32 animate-pulse rounded-2xl bg-muted" /></div>}>
      <OrdersListPageInner />
    </React.Suspense>
  );
}

function OrdersListPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const [orders, setOrders] = React.useState<Array<{ id: string; data: StoredOrder }>>([]);

  React.useEffect(() => {
    const out: Array<{ id: string; data: StoredOrder }> = [];
    for (const id of ids) {
      const raw = sessionStorage.getItem(`order:${id}`);
      if (!raw) continue;
      try {
        out.push({ id, data: JSON.parse(raw) as StoredOrder });
      } catch {
        // skip malformed
      }
    }
    setOrders(out);
  }, [ids.join(",")]);

  if (ids.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <EmptyMessage
          title="Заказы не найдены"
          description="Не переданы идентификаторы заказов."
          onHome={() => router.push("/")}
        />
      </div>
    );
  }

  const grandTotal = orders.reduce((s, o) => s + o.data.total, 0);
  const itemCount = orders.reduce(
    (s, o) => s + o.data.items.reduce((acc, it) => acc + it.quantity, 0),
    0
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="-ml-2 self-start">
        <ChevronLeft className="size-4" aria-hidden="true" /> На главную
      </Button>

      <div className="flex flex-col items-center gap-3 rounded-3xl border bg-card px-6 py-8 text-center shadow-sm">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Заказы оформлены!</h1>
        <p className="text-sm text-muted-foreground">
          Создано <strong className="text-foreground">{orders.length}</strong> заказ(ов) для{" "}
          <strong className="text-foreground">{itemCount}</strong> блюд на сумму{" "}
          <strong className="text-foreground">{formatPrice(grandTotal)}</strong>
        </p>
        <p className="max-w-md text-xs text-muted-foreground">
          Каждый ресторан готовит и доставляет заказ независимо. Отслеживайте каждый заказ отдельно.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.map(({ id, data }) => (
          <Card key={id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Store className="size-5" />
                </span>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{data.restaurantName ?? data.restaurantId}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.items.length}{" "}
                    {data.items.length === 1
                      ? "блюдо"
                      : data.items.length < 5
                        ? "блюда"
                        : "блюд"}{" "}
                    ·{" "}
                    {data.items.reduce((s, it) => s + it.quantity, 0)} шт
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ID: <span className="font-mono">{id}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <span className="text-sm font-bold tabular-nums">{formatPrice(data.total)}</span>
                <Link
                  href={`/order/${id}`}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Отследить заказ ${id}`}
                >
                  <Truck className="size-4" aria-hidden="true" /> Отследить
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button size="lg" onClick={() => router.push("/")}>
          На главную
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.push("/cart")}>
          Заказать ещё
        </Button>
      </div>
    </div>
  );
}

function EmptyMessage({
  title,
  description,
  onHome,
}: {
  title: string;
  description: string;
  onHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-8 text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button onClick={onHome}>На главную</Button>
    </div>
  );
}
