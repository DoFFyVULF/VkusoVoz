"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { RestaurantCard } from "@/components/restaurant/restaurant-card"
import { DishCard } from "@/components/dish/dish-card"
import { favoritesRestaurantsMock, favoritesDishesMock } from "@/lib/mock-data"

export default function FavoritesPage() {
  const [tab, setTab] = React.useState("restaurants")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Избранное</h1>
        <p className="text-sm text-muted-foreground">Сохраняйте любимые рестораны и блюда — после входа они синхронизируются</p>
      </div>

      <div className="rounded-xl border bg-warm px-4 py-3 text-sm">
        <span className="font-medium">Подсказка:</span> гостевое избранное хранится локально.{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">Войдите</Link>, чтобы синхронизировать на всех устройствах.
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="restaurants">Рестораны · {favoritesRestaurantsMock.length}</TabsTrigger>
          <TabsTrigger value="dishes">Блюда · {favoritesDishesMock.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants" className="mt-4">
          {favoritesRestaurantsMock.length === 0 ? (
            <EmptyState title="Нет избранных ресторанов" description="Нажмите ♡ на карточке ресторана" icon={<Heart className="size-8" />} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {favoritesRestaurantsMock.map((r) => (
                <RestaurantCard key={r.id} slug={r.slug} name={r.name} cuisine={r.cuisine} image={r.image} rating={r.rating} reviewCount={r.reviewCount} deliveryTimeMin={r.deliveryTimeMin} deliveryTimeMax={r.deliveryTimeMax} deliveryFee={r.deliveryFee} minOrderAmount={r.minOrderAmount} distance={r.distance} tags={r.tags} schedule={r.schedule} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dishes" className="mt-4">
          {favoritesDishesMock.length === 0 ? (
            <EmptyState title="Нет избранных блюд" description="Добавляйте блюда в избранное, чтобы быстро заказывать снова" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {favoritesDishesMock.map((d) => (
                <DishCard key={d.id} id={d.id} name={d.name} description={d.description} image={d.image} price={d.price} oldPrice={d.oldPrice} weight={d.weight} badges={d.badges} isAvailable={d.isAvailable} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
