"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Clock, CreditCard, Phone, ChevronLeft, Truck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderTimeline, type TimelineStep } from "@/components/order/order-timeline";
import { RestaurantHeader } from "@/components/order/restaurant-header";
import { formatPrice } from "@/lib/store/cart";

type MockOrder = {
  id: string;
  number: string;
  status: TimelineStep["key"];
  address: string;
  time: string;
  payment: string;
  amount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  restaurantImage?: string | null;
  itemCount: number;
};

const STATUS_ORDER: TimelineStep["key"][] = ["created", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];

const STATUS_LABELS: Record<TimelineStep["key"], { label: string; description: string }> = {
  created: { label: "Заказ создан", description: "Мы получили ваш заказ и передали его ресторану" },
  confirmed: { label: "Подтверждён", description: "Ресторан принял заказ и начал готовить" },
  preparing: { label: "Готовится", description: "Повар готовит ваши блюда" },
  ready: { label: "Готов к выдаче", description: "Блюда упакованы и ждут курьера" },
  out_for_delivery: { label: "У курьера", description: "Курьер уже в пути к вам" },
  delivered: { label: "Доставлен", description: "Приятного аппетита! Оцените заказ" },
  cancelled: { label: "Отменён", description: "Заказ был отменён" },
};

function buildSteps(current: TimelineStep["key"], timestamps: Record<string, string>): TimelineStep[] {
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER.map((key, i) => ({
    key,
    label: STATUS_LABELS[key].label,
    description: STATUS_LABELS[key].description,
    timestamp: timestamps[key],
    completed: i < idx,
    active: i === idx,
  }));
}

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [order, setOrder] = React.useState<MockOrder | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState<TimelineStep["key"]>("created");
  const [timestamps, setTimestamps] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const raw = sessionStorage.getItem(`order:${id}`);
    const now = new Date();
    const baseTimestamps: Record<string, string> = {
      created: now.toISOString(),
    };
    if (raw) {
      try {
        const data = JSON.parse(raw) as { values: { address?: { city: string; street: string; house: string }; contact: { name: string; phone: string }; paymentMethod: string; fulfillmentType: string; timeType: string; scheduledTime: string }; subtotal: number; deliveryFee: number; discount: number; total: number };
        const addr = data.values.address ? `${data.values.address.city}, ${data.values.address.street}, ${data.values.address.house}` : "Самовывоз";
        const time = data.values.timeType === "scheduled" && data.values.scheduledTime
          ? new Date(data.values.scheduledTime).toLocaleString("ru-RU")
          : "Как можно скорее · 30–45 мин";
        setOrder({
          id,
          number: id.replace("VK-", "№ "),
          status: "created",
          address: addr,
          time,
          payment: data.values.paymentMethod === "online" ? "Онлайн картой" : "При получении",
          amount: data.total,
          subtotal: data.subtotal,
          deliveryFee: data.values.fulfillmentType === "pickup" ? 0 : data.deliveryFee,
          discount: data.discount,
          customerName: data.values.contact.name,
          customerPhone: data.values.contact.phone,
          restaurantName: "Burger Lab",
          itemCount: 2,
        });
      } catch {
        fallback();
        return;
      }
    } else {
      fallback();
    }

    function fallback() {
      setOrder({
        id,
        number: id.replace("VK-", "№ "),
        status: "created",
        address: "Москва, Тверская, 9 · кв. 12",
        time: "Как можно скорее · 30–45 мин",
        payment: "Онлайн картой",
        amount: 1847,
        subtotal: 1648,
        deliveryFee: 199,
        discount: 0,
        customerName: "Гость",
        customerPhone: "+7 (999) 123-45-67",
        restaurantName: "Burger Lab",
        itemCount: 2,
      });
    }

    setTimestamps(baseTimestamps);

    const interval = window.setInterval(() => {
      setCurrentStatus((prev) => {
        const idx = STATUS_ORDER.indexOf(prev);
        if (idx >= STATUS_ORDER.length - 1) {
          window.clearInterval(interval);
          return prev;
        }
        const next = STATUS_ORDER[idx + 1];
        setTimestamps((t) => ({ ...t, [next]: new Date().toISOString() }));
        return next;
      });
    }, 8000);

    const initialTimer = window.setTimeout(() => {
      setCurrentStatus("confirmed");
      setTimestamps((t) => ({ ...t, confirmed: new Date().toISOString() }));
    }, 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initialTimer);
    };
  }, [id]);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const steps = buildSteps(currentStatus, timestamps);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-4 -ml-2">
        <ChevronLeft className="size-4" aria-hidden="true" /> На главную
      </Button>

      <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-8 text-center shadow-sm border">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Заказ оформлен!</h1>
        <p className="text-sm text-muted-foreground">
          Номер <span className="font-semibold text-foreground">{order.number}</span> · мы уже передали его ресторану
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button size="lg" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
            <Truck className="size-4" aria-hidden="true" /> Отследить заказ
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/cart")}>
            Заказать ещё
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <RestaurantHeader
          name={order.restaurantName}
          image={order.restaurantImage}
          total={order.amount}
          itemCount={order.itemCount}
          deliveryTime="30–45 мин"
          variant="detailed"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Статус заказа</CardTitle>
          <p className="text-sm text-muted-foreground">Обновляется в реальном времени</p>
        </CardHeader>
        <CardContent>
          <OrderTimeline steps={steps} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-muted-foreground" aria-hidden="true" /> Адрес
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed">{order.address}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-muted-foreground" aria-hidden="true" /> Время
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed">{order.time}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="size-4 text-muted-foreground" aria-hidden="true" /> Оплата
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm">{order.payment}</p>
            <p className="mt-2 text-sm font-bold tabular-nums">{formatPrice(order.amount)}</p>
            <p className="text-xs text-muted-foreground">
              Товары {formatPrice(order.subtotal)} · Доставка {order.deliveryFee === 0 ? "бесплатно" : formatPrice(order.deliveryFee)}
              {order.discount > 0 && ` · Скидка −${formatPrice(order.discount)}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="size-4 text-muted-foreground" aria-hidden="true" /> Контакты
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-warm">
              <MessageSquare className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">Нужна помощь?</p>
              <p className="text-xs text-muted-foreground">Поддержка отвечает в течение минуты</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>Связаться с поддержкой</Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Чек придёт на email. ID заказа: <span className="font-mono font-medium text-foreground">{order.id}</span>
      </p>
    </div>
  );
}
