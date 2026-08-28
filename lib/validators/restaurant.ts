import { z } from "zod";

function s(v: string): string {
  return v.trim().replace(/\s+/g, " ");
}

export const restaurantCreateSchema = z.object({
  name: z.string({ required_error: "Обязательное поле" }).min(2, "Слишком короткое название").max(128, "Слишком длинно").transform(s),
  slug: z
    .string()
    .min(2, "Слишком короткий запрос")
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница, цифры и дефис")
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  description: z.string().max(2000, "Слишком длинное описание").optional().or(z.literal("")).transform((v) => (typeof v === "string" ? v.trim() : v)),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Неверный email").optional().or(z.literal("")),
  city: z.string().min(2, "Укажите город").max(64).transform(s).optional().default("Москва"),
  address: z.string().max(256).optional().or(z.literal("")).transform((v) => (typeof v === "string" ? v.trim() : v)),
  deliveryFee: z.number().int().min(0).max(100000).optional().default(0),
  minOrderAmount: z.number().int().min(0).max(1000000).optional().default(0),
  deliveryTimeMin: z.number().int().min(5).max(240).optional().default(30),
  deliveryTimeMax: z.number().int().min(5).max(240).optional().default(60),
});

export const restaurantUpdateSchema = restaurantCreateSchema.partial();

export const restaurantQuerySchema = z.object({
  q: z.string().max(100).optional().transform((v) => (v ? v.trim() : v)),
  city: z.string().max(64).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "PENDING_MODERATION", "PAUSED", "BLOCKED", "CLOSED"]).optional(),
  sort: z.enum(["rating", "deliveryTime", "price", "createdAt"]).optional().default("rating"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  isActive: z.coerce.boolean().optional(),
});

export type RestaurantCreateInput = z.infer<typeof restaurantCreateSchema>;
export type RestaurantUpdateInput = z.infer<typeof restaurantUpdateSchema>;
export type RestaurantQuery = z.infer<typeof restaurantQuerySchema>;
