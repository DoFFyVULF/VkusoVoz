import Link from "next/link"
import { UtensilsCrossed, Phone, Mail, MapPin, Instagram, Send, AtSign } from "lucide-react"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-8 lg:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-heading text-lg font-bold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <UtensilsCrossed className="size-4" aria-hidden="true" />
              </span>
              ВкусоВоз
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Тёплая гастрономическая доставка. Свежие блюда из локальных продуктов, быстрая доставка и забота в каждой детали.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a href="#" aria-label="Instagram" className="inline-flex size-9 items-center justify-center rounded-xl border bg-background hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Instagram className="size-4" />
              </a>
              <a href="#" aria-label="Telegram" className="inline-flex size-9 items-center justify-center rounded-xl border bg-background hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Send className="size-4" />
              </a>
              <a href="#" aria-label="VK" className="inline-flex size-9 items-center justify-center rounded-xl border bg-background hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <AtSign className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Покупателям</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Каталог</Link></li>
              <li><Link href="/catalog" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Рестораны</Link></li>
              <li><Link href="#" className="hover:text-foreground">Доставка и оплата</Link></li>
              <li><Link href="#" className="hover:text-foreground">Возврат</Link></li>
              <li><Link href="/account/orders" className="hover:text-foreground">Мои заказы</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Партнёрам</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="/restaurant-panel" className="hover:text-foreground">Подключить ресторан</Link></li>
              <li><Link href="/courier" className="hover:text-foreground">Курьерам</Link></li>
              <li><Link href="/admin" className="hover:text-foreground">Админ-панель</Link></li>
              <li><Link href="#" className="hover:text-foreground">Для бизнеса</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Компания</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">О нас</Link></li>
              <li><Link href="#" className="hover:text-foreground">Контакты</Link></li>
              <li><Link href="#" className="hover:text-foreground">Вакансии</Link></li>
              <li><Link href="#" className="hover:text-foreground">Новости</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Контакты</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-2"><Phone className="size-4 shrink-0 text-primary" /> 8 800 555-14-14</li>
              <li className="inline-flex items-center gap-2"><Mail className="size-4 shrink-0 text-primary" /> support@vkusovoz.ru</li>
              <li className="inline-flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" /> Москва · ежедневно 9:00–23:00</li>
            </ul>
            <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
              <Link href="#" className="hover:text-foreground underline underline-offset-4">Политика конфиденциальности</Link>
              <Link href="#" className="hover:text-foreground underline underline-offset-4">Пользовательское соглашение</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} ВкусоВоз. Все права защищены.</span>
          <span>Сделано с заботой · <span className="text-primary">♥</span> в Москве</span>
        </div>
      </div>
    </footer>
  )
}
