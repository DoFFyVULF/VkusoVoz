import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "Укажите email").email("Неверный формат email"),
  password: z.string().min(6, "Минимум 6 символов").max(64, "Слишком длинный пароль"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Имя от 2 символов").max(64, "Слишком длинное имя"),
  email: z.string().min(1, "Укажите email").email("Неверный формат email"),
  phone: z
    .string()
    .min(10, "Укажите телефон")
    .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, "Формат: +7 (999) 123-45-67"),
  password: z.string().min(6, "Минимум 6 символов").max(64),
  confirmPassword: z.string().min(1, "Подтвердите пароль"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
