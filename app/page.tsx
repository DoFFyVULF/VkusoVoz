import Link from "next/link"
import Image from "next/image"
import { Store } from "lucide-react"
import { RestaurantCard } from "@/components/restaurant/restaurant-card"
import { DishCard } from "@/components/dish/dish-card"
import { QuickCategories } from "@/components/home/quick-categories"
import { HeroSection } from "@/components/home/hero-section"
import { restaurantsMock, dishesMock, collectionsMock, quickCategories } from "@/lib/mock-data"

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pt-4 lg:gap-8 lg:pt-6">
        <HeroSection />

        <section aria-labelledby="quick-cats-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="quick-cats-title" className="text-base font-semibold lg:text-lg">Быстрые категории</h2>
            <Link href="/catalog" className="text-sm font-medium text-primary hover:underline">Весь каталог</Link>
          </div>
          <QuickCategories categories={quickCategories} />
        </section>

        <section aria-labelledby="nearby-title" className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 id="nearby-title" className="text-lg font-semibold lg:text-xl">Рядом с вами</h2>
              <p className="text-sm text-muted-foreground">Рестораны с быстрой доставкой — 25–40 мин</p>
            </div>
            <Link href="/catalog" className="hidden text-sm font-medium text-primary hover:underline lg:inline">Смотреть все</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantsMock.map((r) => (
              <RestaurantCard
                key={r.id}
                slug={r.slug}
                name={r.name}
                cuisine={r.cuisine}
                image={r.image}
                rating={r.rating}
                reviewCount={r.reviewCount}
                deliveryTimeMin={r.deliveryTimeMin}
                deliveryTimeMax={r.deliveryTimeMax}
                deliveryFee={r.deliveryFee}
                minOrderAmount={r.minOrderAmount}
                distance={r.distance}
                tags={r.tags}
                schedule={r.schedule}
              />
            ))}
          </div>
          <Link href="/catalog" className="mx-auto inline-flex rounded-xl border bg-surface px-6 py-2.5 text-sm font-semibold lg:hidden">Показать все</Link>
        </section>

        <section aria-labelledby="quick-lunch-title" className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 id="quick-lunch-title" className="text-lg font-semibold lg:text-xl">Быстрый обед</h2>
              <p className="text-sm text-muted-foreground">Популярные блюда — добавим в корзину в один клик</p>
            </div>
            <Link href="/catalog" className="hidden text-sm font-medium text-primary hover:underline lg:inline">Все блюда</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {dishesMock.slice(0, 4).map((d) => (
              <DishCard
                key={d.id}
                id={d.id}
                name={d.name}
                description={d.description}
                image={d.image}
                price={d.price}
                oldPrice={d.oldPrice}
                weight={d.weight}
                badges={d.badges}
                isAvailable={d.isAvailable}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-warm p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Store className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Самовывоз — скидка до 15%</h2>
                <p className="max-w-[520px] text-sm leading-relaxed text-muted-foreground">Заберите заказ сами — без наценки за доставку. Готовим к вашему времени, упакуем с заботой.</p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                  <li className="rounded-full bg-surface border border-border px-3 py-1 text-foreground">Без очереди</li>
                  <li className="rounded-full bg-surface border border-border px-3 py-1 text-foreground">Готово за 15–20 мин</li>
                  <li className="rounded-full bg-primary px-3 py-1 text-primary-foreground">Скидка 10–15%</li>
                </ul>
              </div>
            </div>
            <Link href="/catalog" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Выбрать ресторан</Link>
          </div>
        </section>

        <section aria-labelledby="collections-title" className="flex flex-col gap-4">
          <h2 id="collections-title" className="text-lg font-semibold lg:text-xl">Подборки</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {collectionsMock.map((c) => (
                <Link key={c.id} href="/catalog" className="group relative overflow-hidden rounded-2xl border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={c.image} alt={c.title} fill className="object-cover transition-[transform] duration-150 ease-out motion-reduce:transition-none" sizes="(max-width: 640px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-base font-semibold text-white">{c.title}</h3>
                    <p className="text-sm text-white/80">{c.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

    </div>
  )
}
