export type RestaurantMock = {
  id: string
  slug: string
  name: string
  cuisine: string
  image: string
  coverImage: string
  rating: number
  reviewCount: number
  deliveryTimeMin: number
  deliveryTimeMax: number
  deliveryFee: number
  minOrderAmount: number
  distance: string
  tags: string[]
  isOpen: boolean
  categories: string[]
  schedule: import("./restaurant-hours").DaySchedule[]
}

export type DishMock = {
  id: string
  restaurantId: string
  restaurantSlug: string
  name: string
  description: string
  image: string
  price: number
  oldPrice?: number
  weight?: number
  badges?: ("хит" | "новое")[]
  isAvailable: boolean
}

export type CollectionMock = {
  id: string
  title: string
  subtitle: string
  image: string
}

const defaultDailySchedule = (
  openTime: string,
  closeTime: string
): import("./restaurant-hours").DaySchedule[] =>
  [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    openTime,
    closeTime,
  }))

const closedMonday = (
  openTime: string,
  closeTime: string
): import("./restaurant-hours").DaySchedule[] =>
  [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    openTime,
    closeTime,
    isClosed: dayOfWeek === 1,
  }))

export const restaurantsMock: RestaurantMock[] = [
  {
    id: "1",
    slug: "pechkin-dom",
    name: "Печкин Дом",
    cuisine: "Выпечка · Русская",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=450&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 342,
    deliveryTimeMin: 25,
    deliveryTimeMax: 35,
    deliveryFee: 0,
    minOrderAmount: 500,
    distance: "0.8 км",
    tags: ["Бесплатная доставка", "Хит"],
    isOpen: true,
    categories: ["Выпечка", "Пироги", "Супы"],
    schedule: defaultDailySchedule("08:00", "22:00"),
  },
  {
    id: "2",
    slug: "sushi-tori",
    name: "Суши Тори",
    cuisine: "Суши · Японская",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=450&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 521,
    deliveryTimeMin: 30,
    deliveryTimeMax: 40,
    deliveryFee: 99,
    minOrderAmount: 700,
    distance: "1.2 км",
    tags: ["Скидка 15%"],
    isOpen: true,
    categories: ["Суши", "Роллы", "Сашими"],
    schedule: defaultDailySchedule("10:00", "23:00"),
  },
  {
    id: "3",
    slug: "burger-lab",
    name: "Burger Lab",
    cuisine: "Бургеры · Американская",
    image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=600&h=450&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=1200&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 298,
    deliveryTimeMin: 20,
    deliveryTimeMax: 30,
    deliveryFee: 149,
    minOrderAmount: 600,
    distance: "1.5 км",
    tags: ["Быстро"],
    isOpen: true,
    categories: ["Бургеры", "Картофель", "Напитки"],
    schedule: defaultDailySchedule("12:00", "02:00"),
  },
  {
    id: "4",
    slug: "mamma-roma",
    name: "Mamma Roma",
    cuisine: "Пицца · Итальянская",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 412,
    deliveryTimeMin: 25,
    deliveryTimeMax: 35,
    deliveryFee: 0,
    minOrderAmount: 800,
    distance: "0.6 км",
    tags: ["Новое", "Бесплатная доставка"],
    isOpen: true,
    categories: ["Пицца", "Паста", "Салаты"],
    schedule: defaultDailySchedule("11:00", "02:00"),
  },
  {
    id: "5",
    slug: "wok-street",
    name: "Wok Street",
    cuisine: "Азиатская · Wok",
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=450&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=1200&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 187,
    deliveryTimeMin: 35,
    deliveryTimeMax: 45,
    deliveryFee: 79,
    minOrderAmount: 600,
    distance: "2.0 км",
    tags: [],
    isOpen: false,
    categories: ["Wok", "Лапша", "Рис"],
    schedule: closedMonday("11:00", "23:00"),
  },
  {
    id: "6",
    slug: "teplo-grill",
    name: "Тепло Гриль",
    cuisine: "Гриль · Мясо",
    image: "https://images.unsplash.com/photo-1546964053-d93311cf64a4?w=600&h=450&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1546964053-d93311cf64a4?w=1200&h=400&fit=crop",
    rating: 4.4,
    reviewCount: 156,
    deliveryTimeMin: 30,
    deliveryTimeMax: 40,
    deliveryFee: 99,
    minOrderAmount: 900,
    distance: "1.8 км",
    tags: ["Мясо"],
    isOpen: true,
    categories: ["Гриль", "Шашлык", "Гарниры"],
    schedule: defaultDailySchedule("11:00", "23:00"),
  },
]

export const dishesMock: DishMock[] = [
  {
    id: "d1",
    restaurantId: "4",
    restaurantSlug: "mamma-roma",
    name: "Маргарита 30 см",
    description: "Томатный соус, моцарелла, базилик, оливковое масло",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
    price: 590,
    weight: 420,
    badges: ["хит"],
    isAvailable: true,
  },
  {
    id: "d2",
    restaurantId: "1",
    restaurantSlug: "pechkin-dom",
    name: "Борщ с пампушками",
    description: "Наваристый борщ, сметана, чесночные пампушки 2 шт",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop",
    price: 420,
    weight: 350,
    badges: ["хит"],
    isAvailable: true,
  },
  {
    id: "d3",
    restaurantId: "3",
    restaurantSlug: "burger-lab",
    name: "Смаш бургер двойной",
    description: "Две котлеты, чеддер, соус бургер, маринованные огурцы",
    image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400&h=400&fit=crop",
    price: 650,
    oldPrice: 750,
    weight: 320,
    badges: ["новое"],
    isAvailable: true,
  },
  {
    id: "d4",
    restaurantId: "2",
    restaurantSlug: "sushi-tori",
    name: "Филадельфия классик",
    description: "Лосось, сливочный сыр, огурец, рис, нори — 8 шт",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop",
    price: 890,
    weight: 260,
    badges: ["хит"],
    isAvailable: true,
  },
  {
    id: "d5",
    restaurantId: "2",
    restaurantSlug: "sushi-tori",
    name: "Поке с лососем",
    description: "Рис, лосось, авокадо, эдамаме, соус понзу",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
    price: 720,
    weight: 280,
    isAvailable: false,
  },
  {
    id: "d6",
    restaurantId: "5",
    restaurantSlug: "wok-street",
    name: "Удон с курицей",
    description: "Пшеничная лапша, курица, овощи, соус терияки",
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=400&fit=crop",
    price: 540,
    weight: 350,
    badges: ["новое"],
    isAvailable: true,
  },
  {
    id: "d7",
    restaurantId: "6",
    restaurantSlug: "teplo-grill",
    name: "Стейк рибай",
    description: "Говядина Black Angus, розмарин, соль, перец",
    image: "https://images.unsplash.com/photo-1546964053-d93311cf64a4?w=400&h=400&fit=crop",
    price: 1450,
    weight: 250,
    isAvailable: true,
  },
  {
    id: "d8",
    restaurantId: "1",
    restaurantSlug: "pechkin-dom",
    name: "Курник домашний",
    description: "Слоёное тесто, курица, картофель, грибы, соус",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
    price: 380,
    weight: 300,
    isAvailable: true,
  },
]

export const collectionsMock: CollectionMock[] = [
  {
    id: "c1",
    title: "Завтраки до 12:00",
    subtitle: "Каши, сырники, выпечка",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  },
  {
    id: "c2",
    title: "Постное меню",
    subtitle: "Без мяса и молочки",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
  },
  {
    id: "c3",
    title: "Ужин для двоих",
    subtitle: "Сеты от 1500 ₽",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
  },
]

export const quickCategories = ["Пицца", "Суши", "Бургеры", "Выпечка", "Супы", "Wok", "Гриль", "Десерты", "Завтраки", "Напитки"] as const

export type UserMock = {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

export const userMock: UserMock = {
  id: "u1",
  name: "Анна Иванова",
  email: "anna@example.com",
  phone: "+7 999 123-45-67",
}

export type OrderMock = {
  id: string
  number: string
  date: string
  status: "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled"
  statusLabel: string
  restaurant: string
  items: string
  total: number
  address: string
}

export const ordersMock: OrderMock[] = [
  { id: "o1", number: "№ 48291", date: "27 авг 2026 · 18:42", status: "delivering", statusLabel: "В пути", restaurant: "Mamma Roma", items: "Маргарита ×1, Карбонара ×1", total: 1210, address: "ул. Тверская, 12 · кв. 45" },
  { id: "o2", number: "№ 48103", date: "24 авг 2026 · 12:15", status: "delivered", statusLabel: "Доставлен", restaurant: "Печкин Дом", items: "Борщ с пампушками ×2", total: 840, address: "ул. Арбат, 5" },
  { id: "o3", number: "№ 47988", date: "19 авг 2026 · 20:03", status: "cancelled", statusLabel: "Отменён", restaurant: "Суши Тори", items: "Филадельфия ×1, Поке ×1", total: 1610, address: "ул. Тверская, 12" },
  { id: "o4", number: "№ 47820", date: "15 авг 2026 · 14:30", status: "delivered", statusLabel: "Доставлен", restaurant: "Burger Lab", items: "Смаш бургер ×2", total: 1300, address: "ул. Тверская, 12" },
]

export type AddressMock = {
  id: string
  label: string
  value: string
  isDefault?: boolean
  lat?: number
  lng?: number
}

export const addressesMock: AddressMock[] = [
  { id: "a1", label: "Дом", value: "Москва, ул. Тверская, 12 · кв. 45 · подъезд 2 · 5 этаж", isDefault: true, lat: 55.76, lng: 37.61 },
  { id: "a2", label: "Работа", value: "Москва, ул. Арбат, 5 · офис 301", lat: 55.75, lng: 37.59 },
]

export type ReviewMock = {
  id: string
  restaurant: string
  rating: number
  text: string
  date: string
  status: "pending" | "approved" | "rejected"
  statusLabel: string
}

export const reviewsMock: ReviewMock[] = [
  { id: "rv1", restaurant: "Mamma Roma", rating: 5, text: "Лучшая пицца в городе! Тесто воздушное, доставили тёплой.", date: "24 авг 2026", status: "approved", statusLabel: "Опубликован" },
  { id: "rv2", restaurant: "Печкин Дом", rating: 4, text: "Борщ наваристый, пампушки свежие. Чуть долго везли.", date: "19 авг 2026", status: "pending", statusLabel: "На модерации" },
  { id: "rv3", restaurant: "Суши Тори", rating: 5, text: "Свежайшие роллы, всё аккуратно.", date: "10 авг 2026", status: "approved", statusLabel: "Опубликован" },
]

export type PromoMock = {
  id: string
  code: string
  discount: string
  desc: string
  validUntil: string
}

export const promosMock: PromoMock[] = [
  { id: "p1", code: "VKUS10", discount: "10%", desc: "На первый заказ от 800 ₽", validUntil: "до 31 авг 2026" },
  { id: "p2", code: "HELLO500", discount: "500 ₽", desc: "При заказе от 2000 ₽", validUntil: "до 15 сен 2026" },
]

export const favoritesRestaurantsMock = restaurantsMock.slice(0, 2)
export const favoritesDishesMock = dishesMock.slice(0, 3)

/**
 * Находит расписание ресторана по его slug.
 * Используется в cart и на странице ресторана, где slug — основной идентификатор.
 */
export function getRestaurantScheduleBySlug(slug: string): import("./restaurant-hours").DaySchedule[] {
  return restaurantsMock.find((r) => r.slug === slug)?.schedule ?? []
}

export const demoRestaurant = {
  slug: "mamma-roma",
  name: "Mamma Roma",
  cuisine: "Итальянская · Пицца · Паста",
  rating: 4.8,
  reviewCount: 412,
  deliveryTimeMin: 25,
  deliveryTimeMax: 35,
  deliveryFee: 0,
  minOrderAmount: 800,
  address: "ул. Тверская, 12 · Москва",
  coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&h=600&fit=crop",
  image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=600&fit=crop",
  description: "Неаполитанская пицца на закваске, паста ручной работы и тёплая атмосфера Италии. Печь на дровах, локальные продукты.",
  isOpen: true,
  schedule: defaultDailySchedule("11:00", "02:00"),
  categories: [
    { id: "cat1", slug: "pizza", name: "Пицца" },
    { id: "cat2", slug: "pasta", name: "Паста" },
    { id: "cat3", slug: "salads", name: "Салаты" },
    { id: "cat4", slug: "desserts", name: "Десерты" },
    { id: "cat5", slug: "drinks", name: "Напитки" },
  ],
  menu: [
    {
      categoryId: "cat1",
      dishes: [
        {
          id: "rm1",
          name: "Маргарита",
          description: "Томаты, моцарелла, базилик",
          price: 590,
          weight: 420,
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
          badges: ["хит"] as const,
          isAvailable: true,
        },
        {
          id: "rm2",
          name: "Пепперони",
          description: "Пепперони, моцарелла, томатный соус",
          price: 690,
          weight: 450,
          image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop",
          badges: [] as const,
          isAvailable: true,
        },
        {
          id: "rm3",
          name: "Четыре сыра",
          description: "Моцарелла, горгонзола, пармезан, эмменталь",
          price: 790,
          weight: 430,
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
          badges: ["новое"] as const,
          isAvailable: true,
        },
      ],
    },
    {
      categoryId: "cat2",
      dishes: [
        {
          id: "rm4",
          name: "Карбонара",
          description: "Спагетти, бекон, сливки, пармезан, яйцо",
          price: 620,
          weight: 320,
          image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop",
          badges: [] as const,
          isAvailable: true,
        },
        {
          id: "rm5",
          name: "Болоньезе",
          description: "Тальятелле, мясной рагу, томаты",
          price: 590,
          weight: 350,
          image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=400&fit=crop",
          badges: [] as const,
          isAvailable: false,
        },
      ],
    },
    {
      categoryId: "cat3",
      dishes: [
        {
          id: "rm6",
          name: "Цезарь с курицей",
          description: "Романо, курица, пармезан, соус цезарь",
          price: 540,
          weight: 250,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
          badges: [] as const,
          isAvailable: true,
        },
      ],
    },
  ],
  reviews: [
    { id: "r1", author: "Анна", rating: 5, text: "Лучшая пицца в городе! Тесто воздушное, начинки много.", date: "12 авг 2026" },
    { id: "r2", author: "Игорь", rating: 4, text: "Вкусно, доставили быстро. Паста чуть пересолена.", date: "8 авг 2026" },
    { id: "r3", author: "Мария", rating: 5, text: "Обожаю это место, всегда свежо и тепло.", date: "1 авг 2026" },
  ],
}

// ============================================================
// Admin: Audit logs & Settings
// ============================================================

export type AuditLogLevel = "info" | "warning" | "error" | "success"

export type AuditLogMock = {
  id: string
  createdAt: string // ISO
  actorId: string | null
  actorName: string
  action: string // e.g. "order.cancel"
  entity: string // e.g. "Order"
  entityId: string | null
  level: AuditLogLevel
  ip?: string
  meta?: Record<string, string | number | boolean | null>
}

export type AdminSettingsMock = {
  general: {
    siteName: string
    supportEmail: string
    defaultCurrency: "RUB"
    timezone: string
  }
  orders: {
    autoAccept: boolean
    cancellationWindowMin: number
    minOrderAmount: number
  }
  delivery: {
    baseFee: number
    freeThreshold: number
    maxDistanceKm: number
  }
  notifications: {
    newOrderEmail: boolean
    newOrderPush: boolean
    lowRatingAlert: boolean
  }
  maintenance: {
    enabled: boolean
    message?: string | undefined
  }
}

export const adminSettingsDefault: AdminSettingsMock = {
  general: {
    siteName: "ВкусоВоз",
    supportEmail: "support@vkusovoz.ru",
    defaultCurrency: "RUB",
    timezone: "Europe/Moscow",
  },
  orders: {
    autoAccept: true,
    cancellationWindowMin: 10,
    minOrderAmount: 500,
  },
  delivery: {
    baseFee: 199,
    freeThreshold: 1500,
    maxDistanceKm: 12,
  },
  notifications: {
    newOrderEmail: true,
    newOrderPush: true,
    lowRatingAlert: false,
  },
  maintenance: {
    enabled: false,
    message: "Сайт временно недоступен. Скоро вернёмся.",
  },
}

const _now = Date.now()
const _iso = (offsetMin: number) => new Date(_now - offsetMin * 60_000).toISOString()

export const auditLogsMock: AuditLogMock[] = [
  {
    id: "log_001",
    createdAt: _iso(2),
    actorId: "u_admin",
    actorName: "Алина Орлова",
    action: "order.refund",
    entity: "Order",
    entityId: "ord_9412",
    level: "warning",
    ip: "10.0.0.4",
    meta: { amount: 2380, reason: "опоздание курьера" },
  },
  {
    id: "log_002",
    createdAt: _iso(7),
    actorId: "u_admin",
    actorName: "Алина Орлова",
    action: "restaurant.approve",
    entity: "Restaurant",
    entityId: "r_77",
    level: "success",
    ip: "10.0.0.4",
  },
  {
    id: "log_003",
    createdAt: _iso(14),
    actorId: "u_moderator",
    actorName: "Илья Соколов",
    action: "review.reject",
    entity: "Review",
    entityId: "rev_318",
    level: "info",
    ip: "10.0.0.7",
    meta: { reason: "нецензурная лексика" },
  },
  {
    id: "log_004",
    createdAt: _iso(22),
    actorId: null,
    actorName: "system",
    action: "auth.login.failed",
    entity: "User",
    entityId: "u_4102",
    level: "error",
    ip: "203.0.113.55",
    meta: { attempts: 5 },
  },
  {
    id: "log_005",
    createdAt: _iso(33),
    actorId: "u_admin",
    actorName: "Алина Орлова",
    action: "user.role.update",
    entity: "User",
    entityId: "u_104",
    level: "info",
    meta: { from: "customer", to: "manager" },
  },
  {
    id: "log_006",
    createdAt: _iso(48),
    actorId: "u_admin",
    actorName: "Алина Орлова",
    action: "settings.update",
    entity: "Settings",
    entityId: null,
    level: "info",
    meta: { section: "delivery" },
  },
  {
    id: "log_007",
    createdAt: _iso(65),
    actorId: "u_manager",
    actorName: "Олег Ким",
    action: "order.cancel",
    entity: "Order",
    entityId: "ord_9380",
    level: "warning",
    ip: "10.0.0.9",
  },
  {
    id: "log_008",
    createdAt: _iso(90),
    actorId: null,
    actorName: "system",
    action: "cron.daily_report",
    entity: "Report",
    entityId: null,
    level: "success",
  },
  {
    id: "log_009",
    createdAt: _iso(120),
    actorId: "u_moderator",
    actorName: "Илья Соколов",
    action: "promo.deactivate",
    entity: "Promo",
    entityId: "p_welcome10",
    level: "info",
  },
  {
    id: "log_010",
    createdAt: _iso(180),
    actorId: null,
    actorName: "system",
    action: "db.backup.failed",
    entity: "System",
    entityId: null,
    level: "error",
    meta: { code: "DISK_FULL" },
  },
  {
    id: "log_011",
    createdAt: _iso(240),
    actorId: "u_admin",
    actorName: "Алина Орлова",
    action: "restaurant.suspend",
    entity: "Restaurant",
    entityId: "r_22",
    level: "warning",
    meta: { reason: "жалобы клиентов" },
  },
  {
    id: "log_012",
    createdAt: _iso(360),
    actorId: "u_admin",
    actorName: "Алина Орлова",
    action: "user.invite",
    entity: "User",
    entityId: "u_503",
    level: "success",
  },
]

