"use client"

import * as React from "react"
import { Heart, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/toast"
import { useFavoritesStore } from "@/lib/store/favorites"
import { cn } from "@/lib/utils"

interface Props {
  /** Slug ресторана — используется как идентификатор избранного. */
  restaurantSlug: string
  /** Название для тоста/шеринга. */
  restaurantName: string
  /** Короткое описание для шеринга. */
  restaurantDescription?: string
  /** Класс контейнера (например, "hidden items-center gap-2 lg:flex"). */
  className?: string
}

/**
 * Кнопки «В избранное» и «Поделиться» в hero-секции ресторана.
 *
 * - Избранное: гостям показывает пульс + auth-тост; авторизованным переключает
 *   состояние в zustand-сторе (синхронизируется с localStorage).
 * - Поделиться: navigator.share() с fallback'ом на копирование ссылки.
 */
export function FavoriteShareButtons({
  restaurantSlug,
  restaurantName,
  restaurantDescription,
  className,
}: Props) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const isFavorite = useFavoritesStore((s) => s.restaurantSlugs.includes(restaurantSlug))
  const toggleFavorite = useFavoritesStore((s) => s.toggleRestaurant)
  const [pulsing, setPulsing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleFavorite = () => {
    // Гость: пульс + тост с призывом войти.
    if (!isAuthenticated && !isAuthLoading) {
      setPulsing(true)
      window.setTimeout(() => setPulsing(false), 700)
      toast({
        title: "Войдите, чтобы добавить в избранное",
        description: "Сохранённые рестораны будут синхронизированы между устройствами.",
        variant: "warning",
        duration: 4500,
      })
      return
    }
    // Авторизован: переключаем.
    toggleFavorite(restaurantSlug)
    toast({
      title: isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
      description: isFavorite ? undefined : restaurantName,
      variant: isFavorite ? "default" : "success",
      duration: 2500,
    })
  }

  const handleShare = async () => {
    const shareData = {
      title: restaurantName,
      text: restaurantDescription ?? "Загляни — выглядит вкусно",
      url: typeof window !== "undefined" ? window.location.href : "",
    }
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData)
        return
      }
    } catch (err) {
      // пользователь отменил — не показываем ошибку
      if (err instanceof Error && err.name === "AbortError") return
    }
    // Fallback: копируем ссылку.
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url)
      } else if (typeof document !== "undefined") {
        const ta = document.createElement("textarea")
        ta.value = shareData.url
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Ссылка скопирована",
        description: "Поделитесь ею с друзьями",
        variant: "success",
        duration: 2500,
      })
    } catch {
      toast({
        title: "Не удалось поделиться",
        description: "Попробуйте позже",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={
          isFavorite ? `Убрать «${restaurantName}» из избранного` : `Добавить «${restaurantName}» в избранное`
        }
        aria-pressed={isFavorite}
        onClick={handleFavorite}
        className="relative bg-surface/90 backdrop-blur"
      >
        {/* Кольцо-пульс для гостя: анимированный outline поверх кнопки. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary",
            pulsing ? "animate-ping" : "hidden"
          )}
        />
        <Heart
          className={cn(
            "size-4 transition-transform",
            isFavorite && "fill-destructive text-destructive",
            pulsing && "scale-125"
          )}
          aria-hidden="true"
        />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Поделиться"
        onClick={handleShare}
        className="bg-surface/90 backdrop-blur"
      >
        {copied ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}
