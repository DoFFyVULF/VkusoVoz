"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { userMock } from "@/lib/mock-data"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/lib/store/auth"

const schema = z.object({
  name: z.string().min(2, "Имя от 2 символов").max(64),
  email: z.string().email("Неверный email"),
  phone: z.string().min(10, "Укажите телефон").regex(/^(\+7|8)?\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, "Неверный формат"),
})

type Values = z.infer<typeof schema>

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = React.useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: userMock.name, email: userMock.email, phone: userMock.phone },
  })

  const onSubmit = async (data: Values) => {
    await new Promise((r) => setTimeout(r, 700))
    toast({ title: "Сохранено", description: "Данные профиля обновлены", variant: "success" })
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await api.auth.logout()
      useAuthStore.getState().clear()
      toast({ title: "Вы вышли", description: "До новых встреч", variant: "default" })
      try { localStorage.removeItem("vkusovoz-cart") } catch {}
      router.push("/")
      router.refresh()
    } catch {
      useAuthStore.getState().clear()
      toast({ title: "Вы вышли", description: "Сессия завершена", variant: "default" })
      router.push("/")
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Профиль</h1>
        <p className="text-sm text-muted-foreground">Обновите личные данные — они используются при оформлении заказа</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Личные данные</CardTitle>
          <CardDescription>Имя, email и телефон видны только вам и ресторану при заказе</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input label="Имя" required placeholder="Иван" error={errors.name?.message} {...register("name")} />
            <Input label="Email" required type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Input label="Телефон" required type="tel" autoComplete="tel" placeholder="+7 999 123-45-67" error={errors.phone?.message} helperText="На этот номер будут приходить уведомления о заказе" {...register("phone")} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty && !isSubmitting}>
                Сохранить
              </Button>
              <Button type="button" variant="outline" onClick={() => toast({ title: "Отменено", description: "Изменения не сохранены" })}>
                Отмена
              </Button>
            </div>
          </form>
          <div className="mt-6 border-t pt-6">
            <Button variant="outline" onClick={handleLogout} loading={loggingOut} aria-label="Выйти из аккаунта">
              <LogOut className="size-4" aria-hidden="true" />
              Выйти из аккаунта
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold">Безопасность</h3>
          <p className="mt-1 text-sm text-muted-foreground">Пароль можно сменить в настройках безопасности. Мы никогда не запрашиваем пароль по телефону.</p>
        </CardContent>
      </Card>
    </div>
  )
}
