import { z } from "zod";

export const cartOptionSchema = z.object({
  optionItemId: z.string({ required_error: "Обязательное поле" }).min(1, "Обязательное поле"),
  quantity: z.number().int().min(1).max(99).optional().default(1),
});

export const addItemSchema = z.object({
  dishId: z.string({ required_error: "Обязательное поле" }).min(1, "Обязательное поле"),
  quantity: z.number({ required_error: "Обязательное поле" }).int("Целое число").min(1, "Минимум 1").max(99, "Максимум 99"),
  options: z.array(cartOptionSchema).max(20).optional().default([]),
  comment: z.string().max(500, "Комментарий до 500 символов").optional().or(z.literal("")).transform((v) => (typeof v === "string" ? v.trim() : v)),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Минимум 1").max(99, "Максимум 99"),
  comment: z.string().max(500).optional().or(z.literal("")),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
