"use client"

import * as React from "react"
import Link from "next/link"
import type { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { loginSchema, type LoginValues } from "@/lib/validators/auth"
import { api, ApiClientError } from "@/lib/api/client"
import { useAuthStore } from "@/lib/store/auth"

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="mx-auto w-full max-w-[480px] px-4 py-8"><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>}>
      <LoginPageInner />
    </React.Suspense>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [show, setShow] = React.useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginValues) => {
    try {
      const res = await api.auth.login({ email: data.email, password: data.password })
      useAuthStore.getState().setUser({
        id: res.id,
        email: res.email,
        name: res.name,
        role: res.role,
      })
      toast({ title: "Вход выполнен", description: `Добро пожаловать, ${res.name ?? data.email}`, variant: "success" })
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
      const message = e instanceof ApiClientError ? e.message : e instanceof Error ? e.message : "Ошибка входа"
      toast({ title: "Ошибка входа", description: message, variant: "destructive" })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>Войдите в аккаунт, чтобы видеть заказы и избранное</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Пароль <span className="ml-1 text-destructive" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="flex h-11 min-h-11 w-full rounded-xl border border-input bg-background px-3 pr-11 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[error=true]:border-destructive"
                  data-error={Boolean(errors.password)}
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={show ? "Скрыть пароль" : "Показать пароль"}
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
              Войти
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link href="/auth/register" className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                Зарегистрироваться
              </Link>
            </p>
            <Link href="#" className="text-center text-xs text-muted-foreground hover:text-foreground">
              Забыли пароль?
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
