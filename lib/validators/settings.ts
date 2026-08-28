import { z } from "zod";

export const settingsSchema = z.object({
  general: z.object({
    siteName: z.string().min(2, "Название от 2 символов").max(64, "Слишком длинное"),
    supportEmail: z.string().email("Неверный email"),
    defaultCurrency: z.literal("RUB"),
    timezone: z.string().min(2, "Укажите таймзону"),
  }),
  orders: z.object({
    autoAccept: z.boolean(),
    cancellationWindowMin: z
      .number({ invalid_type_error: "Только число" })
      .int("Только целое")
      .min(0, "Не меньше 0")
      .max(120, "Не больше 120 мин"),
    minOrderAmount: z
      .number({ invalid_type_error: "Только число" })
      .int("Только целое")
      .min(0, "Не меньше 0")
      .max(100000, "Слишком большое"),
  }),
  delivery: z.object({
    baseFee: z
      .number({ invalid_type_error: "Только число" })
      .int("Только целое")
      .min(0, "Не меньше 0")
      .max(5000, "Слишком большое"),
    freeThreshold: z
      .number({ invalid_type_error: "Только число" })
      .int("Только целое")
      .min(0, "Не меньше 0")
      .max(100000, "Слишком большое"),
    maxDistanceKm: z
      .number({ invalid_type_error: "Только число" })
      .min(0.1, "Минимум 0.1")
      .max(100, "Не больше 100"),
  }),
  notifications: z.object({
    newOrderEmail: z.boolean(),
    newOrderPush: z.boolean(),
    lowRatingAlert: z.boolean(),
  }),
  maintenance: z.object({
    enabled: z.boolean(),
    message: z.string().max(280, "До 280 символов").optional().or(z.literal("")),
  }),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
