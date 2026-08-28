import { z } from "zod";

export const fulfillmentSchema = z.enum(["delivery", "pickup"]);

export const paymentSchema = z.enum(["online", "cash"]);

export const timeTypeSchema = z.enum(["asap", "scheduled"]);

export const addressSchema = z.object({
  city: z.string().min(2, "Укажите город").max(64),
  street: z.string().min(2, "Укажите улицу").max(128),
  house: z.string().min(1, "Укажите дом").max(16),
  apartment: z.string().max(16).optional().or(z.literal("")),
  entrance: z.string().max(16).optional().or(z.literal("")),
  floor: z.string().max(16).optional().or(z.literal("")),
  intercom: z.string().max(16).optional().or(z.literal("")),
  comment: z.string().max(500).optional().or(z.literal("")),
  savedAddressId: z.string().optional().or(z.literal("")),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Имя от 2 символов").max(64, "Слишком длинное имя"),
  phone: z
    .string()
    .min(10, "Укажите телефон")
    .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, "Формат: +7 (999) 123-45-67"),
  email: z.string().email("Неверный email").optional().or(z.literal("")),
});

export const checkoutSchema = z
  .object({
    fulfillmentType: fulfillmentSchema,
    address: addressSchema.optional(),
    timeType: timeTypeSchema,
    scheduledTime: z.string().optional().or(z.literal("")),
    contact: contactSchema,
    paymentMethod: paymentSchema,
    comment: z.string().max(500, "Комментарий до 500 символов").optional().or(z.literal("")),
    promoCode: z.string().max(32).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillmentType === "delivery") {
      if (!data.address?.city || data.address.city.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address", "city"], message: "Укажите город" });
      }
      if (!data.address?.street || data.address.street.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address", "street"], message: "Укажите улицу" });
      }
      if (!data.address?.house || data.address.house.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address", "house"], message: "Укажите дом" });
      }
    }
    if (data.timeType === "scheduled" && !data.scheduledTime) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["scheduledTime"], message: "Выберите дату и время" });
    }
    if (data.timeType === "scheduled" && data.scheduledTime) {
      const d = new Date(data.scheduledTime);
      if (Number.isNaN(d.getTime()) || d.getTime() < Date.now() + 30 * 60 * 1000) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["scheduledTime"], message: "Время должно быть минимум через 30 минут" });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;

export const promoSchema = z.object({
  code: z.string().min(2, "Введите промокод").max(32),
});

export type PromoFormValues = z.infer<typeof promoSchema>;
