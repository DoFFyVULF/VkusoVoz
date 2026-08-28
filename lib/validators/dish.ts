import { z } from "zod";

function s(v: string): string {
  return v.trim().replace(/\s+/g, " ");
}

export const dishCreateSchema = z.object({
  categoryId: z.string({ required_error: "Обязательное поле" }).min(1, "Обязательное поле"),
  name: z.string({ required_error: "Обязательное поле" }).min(2, "Слишком короткое название").max(128, "Слишком длинно").transform(s),
  description: z.string().max(2000).optional().or(z.literal("")).transform((v) => (typeof v === "string" ? v.trim() : v)),
  image: z.string().url("Неверный URL").optional().or(z.literal("")),
  price: z.number({ required_error: "Обязательное поле" }).int("Цена в копейках").min(0, "Цена не может быть отрицательной").max(10000000, "Слишком высокая цена"),
  oldPrice: z.number().int().min(0).max(10000000).optional().nullable(),
  weight: z.number().int().min(0).max(10000, "Слишком большой вес").optional().nullable(),
  calories: z.number().int().min(0).max(10000).optional().nullable(),
  isAvailable: z.boolean().optional().default(true),
  isPopular: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).max(10000).optional().default(0),
});

export const dishUpdateSchema = dishCreateSchema.partial();

export const dishQuerySchema = z.object({
  q: z.string().max(100).optional().transform((v) => (v ? v.trim() : v)),
  categoryId: z.string().optional(),
  isAvailable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type DishCreateInput = z.infer<typeof dishCreateSchema>;
export type DishUpdateInput = z.infer<typeof dishUpdateSchema>;
