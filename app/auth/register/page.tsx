"use client"

import * as React from "react"
import Link from "next/link"
import type { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { registerSchema, type RegisterValues } from "@/lib/validators/auth"
import { api, ApiClientError } from "@/lib/api/client"

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="mx-auto w-full max-w-[480px] px-4 py-8"><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>}>
      <RegisterPageInner />
    </React.Suspense>
  )
}

function RegisterPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [show, setShow] = React.useState(false)
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (data: RegisterValues) => {
    try {
      const res = await api.auth.register({ name: data.name, email: data.email, phone: data.phone, password: data.password })
      toast({ title: "Аккаунт создан", description: `Добро пожаловать, ${res.name}!`, variant: "success" })
      const next = searchParams.get("next")
      let redirect: Route = (next as Route | null) ?? "/account"
      if (!next) {
        if (res.role === "ADMIN") redirect = "/admin"
        else if (res.role === "RESTAURANT_OWNER") redirect = "/restaurant-panel"
        else if (res.role === "COURIER") redirect = "/courier"
      }
      router.push(redirect)
      router.refresh()
    } catch (e) {
      const message = e instanceof ApiClientError ? e.message : e instanceof Error ? e.message : "Ошибка регистрации"
      toast({ title: "Ошибка регистрации", description: message, variant: "destructive" })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт — избранное и заказы сохранятся</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input label="Имя" required placeholder="Анна" error={errors.name?.message} {...register("name")} />
            <Input label="Email" type="email" required autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Controller
              control={control}
              name="phone"
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium leading-none">
                Пароль <span className="ml-1 text-destructive" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Минимум 6 символов"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "reg-password-error" : undefined}
                  className="flex h-11 min-h-11 w-full rounded-xl border border-input bg-background px-3 pr-11 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("password")}
                />
                <button type="button" aria-label={show ? "Скрыть пароль" : "Показать пароль"} onClick={() => setShow((s) => !s)} className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p id="reg-password-error" role="alert" className="text-xs font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <Input label="Подтвердите пароль" required type={show ? "text" : "password"} placeholder="Повторите пароль" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

            <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
              Создать аккаунт
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Войти
              </Link>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Регистрируясь, вы соглашаетесь с{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-foreground">пользовательским соглашением</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
