import { z } from "zod";

export const orderTypeSchema = z.enum(["DELIVERY", "PICKUP"], { required_error: "Обязательное поле" });
export const paymentMethodSchema = z.enum(["MOCK", "CASH", "CARD_ONLINE", "SBP"], { required_error: "Обязательное поле" });

export const orderItemInputSchema = z.object({
  dishId: z.string({ required_error: "Обязательное поле" }).min(1, "Обязательное поле"),
  quantity: z.number().int().min(1).max(99),
  options: z
    .array(z.object({ optionItemId: z.string().min(1), quantity: z.number().int().min(1).max(99).optional().default(1) }))
    .optional()
    .default([]),
  comment: z.string().max(500).optional().or(z.literal("")),
});

export const checkoutSchema = z
  .object({
    restaurantId: z.string({ required_error: "Обязательное поле" }).min(1, "Обязательное поле"),
    type: orderTypeSchema,
    addressId: z.string().optional().nullable().or(z.literal("")),
    items: z.array(orderItemInputSchema).min(1, "Корзина пуста").max(50, "Слишком много позиций"),
    promoCode: z.string().max(32, "Слишком длинный промокод").optional().or(z.literal("")).transform((v) => (v ? v.trim().toUpperCase() : v)),
    desiredTime: z.string().optional().or(z.literal("")).nullable(),
    paymentMethod: paymentMethodSchema.default("MOCK"),
    comment: z.string().max(500, "Комментарий до 500 символов").optional().or(z.literal("")).transform((v) => (typeof v === "string" ? v.trim() : v)),
    customerName: z.string().min(2, "Укажите имя").max(64).optional(),
    customerPhone: z.string().min(10, "Укажите телефон").max(20).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "DELIVERY" && !data.addressId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["addressId"], message: "Укажите адрес доставки" });
    }
    if (data.desiredTime) {
      const d = new Date(data.desiredTime);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["desiredTime"], message: "Неверный формат времени" });
      } else if (d.getTime() < Date.now() + 30 * 60 * 1000) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["desiredTime"], message: "Время должно быть минимум через 30 минут" });
      }
    }
  });

export const estimateSchema = z.object({
  restaurantId: z.string({ required_error: "Обязательное поле" }).min(1, "Обязательное поле"),
  type: orderTypeSchema,
  addressId: z.string().optional().nullable().or(z.literal("")),
  items: z.array(orderItemInputSchema).min(1, "Корзина пуста").max(50, "Слишком много позиций"),
  promoCode: z.string().max(32, "Слишком длинный промокод").optional().or(z.literal("")).transform((v) => (v ? v.trim().toUpperCase() : v)),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type EstimateInput = z.infer<typeof estimateSchema>;
