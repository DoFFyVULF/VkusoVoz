"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, RotateCcw, AlertTriangle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { settingsSchema, type SettingsFormValues } from "@/lib/validators/settings"
import { useSettingsStore, useSettings } from "@/lib/store/settings"
import { adminSettingsDefault } from "@/lib/mock-data"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"

function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  description,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium leading-none">{label}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
          checked ? "bg-primary border-primary" : "bg-muted border-input",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-background shadow-sm transition-transform motion-reduce:transition-none",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  )
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const { settings: persisted, hydrated, setSettings, reset } = useSettings()
  const setHydrated = useSettingsStore((s) => s.setHydrated)

  const {
    register,
    handleSubmit,
    reset: resetForm,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: persisted,
    mode: "onBlur",
  })

  // Re-sync form once persisted settings hydrate from localStorage
  React.useEffect(() => {
    if (hydrated) {
      resetForm(persisted, { keepDirty: false })
    }
  }, [hydrated, persisted, resetForm])

  // Watch for live maintenance toggle to show warning
  const maintenanceEnabled = watch("maintenance.enabled")
  const autoAccept = watch("orders.autoAccept")

  const handleResetDefaults = () => {
    resetForm(adminSettingsDefault, { keepDirty: false })
    reset()
    toast({
      title: "Сброшено",
      description: "Настройки возвращены к значениям по умолчанию",
      variant: "info",
    })
  }

  const onSubmit = async (data: SettingsFormValues) => {
    // Simulate API call; on failure we would keep form values
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Try real API (will fail without backend, but form save still works locally)
      api.admin.settings.update(data).catch(() => undefined)
      setSettings(data)
      resetForm(data, { keepDirty: false })
      toast({
        title: "Сохранено",
        description: "Настройки успешно обновлены",
        variant: "success",
      })
    } catch {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки. Попробуйте ещё раз.",
        variant: "destructive",
      })
    }
  }

  // Render guards: we still render with default values during SSR
  // and only swap to persisted values after hydration to avoid mismatch.
  if (!hydrated) {
    return (
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight">Настройки</h1>
        <p className="text-sm text-muted-foreground">Загрузка сохранённых значений…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight">Настройки</h1>
          <p className="text-sm text-muted-foreground">
            Параметры платформы, заказов, доставки и уведомлений
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={isSubmitting}
          >
            <RotateCcw className="size-4" />
            Сбросить
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
        aria-label="Форма настроек админ-панели"
      >
        {/* General */}
        <Card>
          <SectionHeader title="Общие" description="Название сайта, контакты, часовой пояс" />
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Название сайта"
              required
              placeholder="ВкусоВоз"
              error={errors.general?.siteName?.message}
              {...register("general.siteName")}
            />
            <Input
              label="Email поддержки"
              type="email"
              required
              placeholder="support@vkusovoz.ru"
              error={errors.general?.supportEmail?.message}
              {...register("general.supportEmail")}
            />
            <Input
              label="Часовой пояс"
              required
              placeholder="Europe/Moscow"
              helperText="IANA, например Europe/Moscow"
              error={errors.general?.timezone?.message}
              {...register("general.timezone")}
            />
            <Input
              label="Валюта"
              value="RUB"
              disabled
              helperText="Зафиксировано для текущей версии"
            />
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <SectionHeader
            title="Заказы"
            description="Автопринятие, минимальная сумма и окно отмены"
          />
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Switch
                checked={!!autoAccept}
                onCheckedChange={(v) =>
                  setValue("orders.autoAccept", v, { shouldDirty: true, shouldValidate: true })
                }
                label="Автоматически принимать заказы"
                description="Заведения получают заказы без ручного подтверждения"
              />
            </div>
            <Input
              label="Минимальная сумма заказа, ₽"
              type="number"
              inputMode="numeric"
              min={0}
              required
              error={errors.orders?.minOrderAmount?.message}
              {...register("orders.minOrderAmount", { valueAsNumber: true })}
            />
            <Input
              label="Окно отмены, мин"
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              required
              helperText="Сколько минут после оформления клиент может отменить заказ"
              error={errors.orders?.cancellationWindowMin?.message}
              {...register("orders.cancellationWindowMin", { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <SectionHeader
            title="Доставка"
            description="Базовая стоимость, бесплатный порог и радиус"
          />
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Базовая стоимость, ₽"
              type="number"
              inputMode="numeric"
              min={0}
              required
              error={errors.delivery?.baseFee?.message}
              {...register("delivery.baseFee", { valueAsNumber: true })}
            />
            <Input
              label="Бесплатно от, ₽"
              type="number"
              inputMode="numeric"
              min={0}
              required
              helperText="Если 0 — доставка всегда платная"
              error={errors.delivery?.freeThreshold?.message}
              {...register("delivery.freeThreshold", { valueAsNumber: true })}
            />
            <Input
              label="Макс. расстояние, км"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0.1}
              max={100}
              required
              error={errors.delivery?.maxDistanceKm?.message}
              {...register("delivery.maxDistanceKm", { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <SectionHeader
            title="Уведомления"
            description="Каналы оповещений для администраторов и заведений"
          />
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Switch
              checked={!!watch("notifications.newOrderEmail")}
              onCheckedChange={(v) =>
                setValue("notifications.newOrderEmail", v, { shouldDirty: true, shouldValidate: true })
              }
              label="Email о новом заказе"
              description="Письмо администратору"
            />
            <Switch
              checked={!!watch("notifications.newOrderPush")}
              onCheckedChange={(v) =>
                setValue("notifications.newOrderPush", v, { shouldDirty: true, shouldValidate: true })
              }
              label="Push-уведомления"
              description="Браузер и мобильное приложение"
            />
            <Switch
              checked={!!watch("notifications.lowRatingAlert")}
              onCheckedChange={(v) =>
                setValue("notifications.lowRatingAlert", v, { shouldDirty: true, shouldValidate: true })
              }
              label="Низкие оценки"
              description="Алерт при оценке ≤ 3"
            />
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <SectionHeader
            title="Тех. обслуживание"
            description="Включите, чтобы закрыть публичную часть сайта"
          />
          <CardContent className="flex flex-col gap-4">
            <Switch
              checked={!!maintenanceEnabled}
              onCheckedChange={(v) =>
                setValue("maintenance.enabled", v, { shouldDirty: true, shouldValidate: true })
              }
              label="Режим обслуживания"
              description="Пользователи увидят сообщение вместо каталога"
            />
            <Input
              label="Сообщение пользователю"
              placeholder="Сайт временно недоступен. Скоро вернёмся."
              helperText="До 280 символов"
              error={errors.maintenance?.message?.message}
              {...register("maintenance.message")}
            />
            {maintenanceEnabled && (
              <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <p>
                  Публичная часть сайта будет недоступна для посетителей. Админ-панель останется
                  доступной.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-t-xl border border-b-0 bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-center sm:justify-between lg:-mx-6 lg:px-6">
          <p className="text-xs text-muted-foreground">
            {isDirty ? "Есть несохранённые изменения" : "Все изменения сохранены"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => resetForm(persisted, { keepDirty: false })}
              disabled={!isDirty || isSubmitting}
            >
              Отменить
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty && !maintenanceEnabled}>
              <Save className="size-4" />
              Сохранить
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
