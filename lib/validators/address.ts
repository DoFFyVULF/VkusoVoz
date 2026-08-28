import { z } from "zod";

function s(v: string): string {
  return v.trim().replace(/\s+/g, " ");
}

export const addressSchema = z.object({
  label: z.string().max(32, "Слишком длинное название").optional().or(z.literal("")).transform((v) => (v ? s(v) : v)),
  city: z.string({ required_error: "Обязательное поле" }).min(2, "Укажите город").max(64, "Слишком длинно").transform(s),
  street: z.string({ required_error: "Обязательное поле" }).min(2, "Укажите улицу").max(128, "Слишком длинно").transform(s),
  house: z.string({ required_error: "Обязательное поле" }).min(1, "Укажите дом").max(16, "Слишком длинно").transform(s),
  apartment: z.string().max(16, "Слишком длинно").optional().or(z.literal("")).transform((v) => (v ? s(v) : v)),
  entrance: z.string().max(16).optional().or(z.literal("")).transform((v) => (v ? s(v) : v)),
  floor: z.string().max(16).optional().or(z.literal("")).transform((v) => (v ? s(v) : v)),
  intercom: z.string().max(16).optional().or(z.literal("")).transform((v) => (v ? s(v) : v)),
  comment: z.string().max(500, "Комментарий до 500 символов").optional().or(z.literal("")).transform((v) => (v ? v.trim() : v)),
  postalCode: z.string().max(10).optional().or(z.literal("")).transform((v) => (v ? v.trim() : v)),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export const addressUpdateSchema = addressSchema.partial();

export type AddressInput = z.infer<typeof addressSchema>;
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;
