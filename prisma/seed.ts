import { PrismaClient, UserRole, RestaurantStatus, PromoDiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const ownerPassword = await bcrypt.hash("Owner123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vkusovoz.local" },
    update: {},
    create: {
      email: "admin@vkusovoz.local",
      passwordHash: adminPassword,
      name: "Администратор",
      role: UserRole.ADMIN,
      phone: "+79990000001",
      isActive: true,
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: "owner.bakery@vkusovoz.local" },
    update: {},
    create: {
      email: "owner.bakery@vkusovoz.local",
      passwordHash: ownerPassword,
      name: "Анна Пекарева",
      role: UserRole.RESTAURANT_OWNER,
      phone: "+79990000002",
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "owner.tokio@vkusovoz.local" },
    update: {},
    create: {
      email: "owner.tokio@vkusovoz.local",
      passwordHash: ownerPassword,
      name: "Кендзи Токарев",
      role: UserRole.RESTAURANT_OWNER,
      phone: "+79990000003",
    },
  });

  const owner3 = await prisma.user.upsert({
    where: { email: "owner.burger@vkusovoz.local" },
    update: {},
    create: {
      email: "owner.burger@vkusovoz.local",
      passwordHash: ownerPassword,
      name: "Игорь Мясников",
      role: UserRole.RESTAURANT_OWNER,
      phone: "+79990000004",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@vkusovoz.local" },
    update: {},
    create: {
      email: "user@vkusovoz.local",
      passwordHash: userPassword,
      name: "Алексей",
      role: UserRole.USER,
      phone: "+79990000005",
    },
  });

  await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: demoUser.id,
      label: "Дом",
      city: "Москва",
      street: "Тверская",
      house: "10",
      apartment: "15",
      comment: "Подъезд 2, код 123",
      isDefault: true,
      lat: 55.7558,
      lng: 37.6176,
    },
  });

  const promo = await prisma.promoCode.upsert({
    where: { code: "VKUS10" },
    update: {},
    create: {
      code: "VKUS10",
      discountType: PromoDiscountType.PERCENT,
      discountValue: 10,
      minOrderAmount: 100000,
      maxDiscount: 50000,
      usageLimit: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await createBakery(owner1.id);
  await createTokio(owner2.id);
  await createBurger(owner3.id);

  console.log("Seed done", { admin: admin.email, promo: promo.code, demoUser: demoUser.email });
}

async function createBakery(ownerId: string): Promise<void> {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "pekarnya-hleb-i-sol" },
    update: {},
    create: {
      ownerId,
      name: "Пекарня Хлеб & Соль",
      slug: "pekarnya-hleb-i-sol",
      description: "Свежий хлеб каждый день. Печём на закваске, без лишней химии.",
      phone: "+74950000001",
      city: "Москва",
      address: "ул. Поварская, 12",
      status: RestaurantStatus.ACTIVE,
      deliveryFee: 9900,
      minOrderAmount: 50000,
      deliveryTimeMin: 25,
      deliveryTimeMax: 40,
      image: "https://picsum.photos/seed/bakery/600/400",
      coverImage: "https://picsum.photos/seed/bakery-cover/1200/400",
      rating: 4.7,
      reviewCount: 128,
    },
  });

  await prisma.restaurantSchedule.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.restaurantSchedule.createMany({
    data: [
      { restaurantId: restaurant.id, dayOfWeek: 1, openTime: "08:00", closeTime: "21:00", isClosed: false },
      { restaurantId: restaurant.id, dayOfWeek: 2, openTime: "08:00", closeTime: "21:00", isClosed: false },
      { restaurantId: restaurant.id, dayOfWeek: 3, openTime: "08:00", closeTime: "21:00", isClosed: false },
      { restaurantId: restaurant.id, dayOfWeek: 4, openTime: "08:00", closeTime: "21:00", isClosed: false },
      { restaurantId: restaurant.id, dayOfWeek: 5, openTime: "08:00", closeTime: "21:00", isClosed: false },
      { restaurantId: restaurant.id, dayOfWeek: 6, openTime: "09:00", closeTime: "21:00", isClosed: false },
      { restaurantId: restaurant.id, dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: false },
    ],
  });

  await prisma.restaurantZone.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.restaurantZone.createMany({
    data: [
      { restaurantId: restaurant.id, name: "Центр", deliveryFee: 9900, minOrderAmount: 50000, deliveryTimeMin: 25, deliveryTimeMax: 40 },
      { restaurantId: restaurant.id, name: "Дальняя зона", deliveryFee: 19900, minOrderAmount: 80000, deliveryTimeMin: 40, deliveryTimeMax: 60 },
    ],
  });

  const cat1 = await prisma.dishCategory.upsert({
    where: { id: "bakery-cat-1" },
    update: {},
    create: { id: "bakery-cat-1", restaurantId: restaurant.id, name: "Выпечка", sortOrder: 1 },
  });
  const cat2 = await prisma.dishCategory.upsert({
    where: { id: "bakery-cat-2" },
    update: {},
    create: { id: "bakery-cat-2", restaurantId: restaurant.id, name: "Пироги", sortOrder: 2 },
  });
  const cat3 = await prisma.dishCategory.upsert({
    where: { id: "bakery-cat-3" },
    update: {},
    create: { id: "bakery-cat-3", restaurantId: restaurant.id, name: "Напитки", sortOrder: 3 },
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: cat1.id,
    name: "Круассан с маслом",
    description: "Слоистый, хрустящий снаружи и мягкий внутри. На сливочном масле.",
    price: 14900,
    weight: 90,
    image: "https://picsum.photos/seed/croissant/400/300",
    options: [{ name: "Добавки", items: [{ name: "Джем", priceDelta: 3000 }, { name: "Масло", priceDelta: 2000 }] }],
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: cat1.id,
    name: "Бородинский хлеб",
    description: "Ароматный ржаной хлеб с кориандром. Буханка 500 г.",
    price: 18900,
    weight: 500,
    image: "https://picsum.photos/seed/borodinsky/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: cat2.id,
    name: "Пирог с капустой",
    description: "Домашний пирог с тушёной капустой и яйцом. На тонком тесте.",
    price: 29900,
    weight: 600,
    image: "https://picsum.photos/seed/pirog-kapusta/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: cat2.id,
    name: "Пирог с вишней",
    description: "Сладкий пирог с вишней. Кислинка и много начинки.",
    price: 34900,
    weight: 600,
    image: "https://picsum.photos/seed/pirog-vishnya/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: cat1.id,
    name: "Эклер с заварным кремом",
    description: "Нежный эклер, крем ванильный, глазурь шоколадная.",
    price: 11900,
    weight: 80,
    image: "https://picsum.photos/seed/eclair/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: cat3.id,
    name: "Капучино 300 мл",
    description: "На свежем молоке, крепкий эспрессо и пышная пенка.",
    price: 19900,
    image: "https://picsum.photos/seed/cappuccino/400/300",
    options: [{ name: "Молоко", items: [{ name: "Обычное", priceDelta: 0 }, { name: "Безлактозное", priceDelta: 3000 }, { name: "Овсяное", priceDelta: 4000 }] }],
  });
}

async function createTokio(ownerId: string): Promise<void> {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "sushi-bar-tokio" },
    update: {},
    create: {
      ownerId,
      name: "Суши-бар Токио",
      slug: "sushi-bar-tokio",
      description: "Японская кухня без переплат. Рыба свежая, рис правильный.",
      phone: "+74950000002",
      city: "Москва",
      address: "ул. Арбат, 25",
      status: RestaurantStatus.ACTIVE,
      deliveryFee: 14900,
      minOrderAmount: 70000,
      deliveryTimeMin: 30,
      deliveryTimeMax: 50,
      image: "https://picsum.photos/seed/tokio/600/400",
      coverImage: "https://picsum.photos/seed/tokio-cover/1200/400",
      rating: 4.6,
      reviewCount: 342,
    },
  });

  await prisma.restaurantSchedule.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.restaurantSchedule.createMany({
    data: [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      restaurantId: restaurant.id,
      dayOfWeek: d,
      openTime: "11:00",
      closeTime: "23:00",
      isClosed: false,
    })),
  });

  await prisma.restaurantZone.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.restaurantZone.create({
    data: { restaurantId: restaurant.id, name: "Доставка по городу", deliveryFee: 14900, minOrderAmount: 70000, deliveryTimeMin: 30, deliveryTimeMax: 50 },
  });

  const catRolls = await prisma.dishCategory.upsert({
    where: { id: "tokio-cat-1" },
    update: {},
    create: { id: "tokio-cat-1", restaurantId: restaurant.id, name: "Роллы", sortOrder: 1 },
  });
  const catSushi = await prisma.dishCategory.upsert({
    where: { id: "tokio-cat-2" },
    update: {},
    create: { id: "tokio-cat-2", restaurantId: restaurant.id, name: "Суши и сашими", sortOrder: 2 },
  });
  const catSoup = await prisma.dishCategory.upsert({
    where: { id: "tokio-cat-3" },
    update: {},
    create: { id: "tokio-cat-3", restaurantId: restaurant.id, name: "Супы", sortOrder: 3 },
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catRolls.id,
    name: "Филадельфия классик",
    description: "Лосось, сливочный сыр, огурец, рис и нори. 8 штук.",
    price: 59900,
    weight: 260,
    image: "https://picsum.photos/seed/phila/400/300",
    isPopular: true,
    options: [{ name: "Соус", items: [{ name: "Соевый", priceDelta: 0 }, { name: "Спайси", priceDelta: 3000 }] }],
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catRolls.id,
    name: "Калифорния с крабом",
    description: "Краб, авокадо, огурец, икра. Лёгкий и сытный.",
    price: 54900,
    weight: 240,
    image: "https://picsum.photos/seed/california/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catSushi.id,
    name: "Сяке нигири",
    description: "2 штуки. Свежий лосось на рисе.",
    price: 29900,
    weight: 70,
    image: "https://picsum.photos/seed/sake-nigiri/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catSushi.id,
    name: "Унаги нигири",
    description: "2 штуки. Копчёный угорь, соус унаги.",
    price: 34900,
    weight: 70,
    image: "https://picsum.photos/seed/unagi/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catSoup.id,
    name: "Мисо суп",
    description: "Традиционный суп с тофу, водорослями и грибами.",
    price: 24900,
    weight: 300,
    image: "https://picsum.photos/seed/miso/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catSoup.id,
    name: "Рамен с курицей",
    description: "Насыщенный бульон, лапша, курица, яйцо и зелёный лук.",
    price: 44900,
    weight: 450,
    image: "https://picsum.photos/seed/ramen/400/300",
    options: [{ name: "Острота", items: [{ name: "Не остро", priceDelta: 0 }, { name: "Средне", priceDelta: 0 }, { name: "Остро", priceDelta: 0 }] }],
  });
}

async function createBurger(ownerId: string): Promise<void> {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "burgernaya-myaso-i-ogon" },
    update: {},
    create: {
      ownerId,
      name: "Бургерная Мясо & Огонь",
      slug: "burgernaya-myaso-i-ogon",
      description: "Сочные бургеры на огне. Котлеты из мраморной говядины.",
      phone: "+74950000003",
      city: "Москва",
      address: "ул. Тверская, 8",
      status: RestaurantStatus.ACTIVE,
      deliveryFee: 9900,
      minOrderAmount: 60000,
      deliveryTimeMin: 20,
      deliveryTimeMax: 35,
      image: "https://picsum.photos/seed/burger/600/400",
      coverImage: "https://picsum.photos/seed/burger-cover/1200/400",
      rating: 4.8,
      reviewCount: 521,
    },
  });

  await prisma.restaurantSchedule.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.restaurantSchedule.createMany({
    data: [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      restaurantId: restaurant.id,
      dayOfWeek: d,
      openTime: "12:00",
      closeTime: "23:00",
      isClosed: false,
    })),
  });

  await prisma.restaurantZone.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.restaurantZone.create({
    data: { restaurantId: restaurant.id, name: "Ближняя зона", deliveryFee: 9900, minOrderAmount: 60000, deliveryTimeMin: 20, deliveryTimeMax: 35 },
  });

  const catBurgers = await prisma.dishCategory.upsert({
    where: { id: "burger-cat-1" },
    update: {},
    create: { id: "burger-cat-1", restaurantId: restaurant.id, name: "Бургеры", sortOrder: 1 },
  });
  const catSnacks = await prisma.dishCategory.upsert({
    where: { id: "burger-cat-2" },
    update: {},
    create: { id: "burger-cat-2", restaurantId: restaurant.id, name: "Закуски", sortOrder: 2 },
  });
  const catDrinks = await prisma.dishCategory.upsert({
    where: { id: "burger-cat-3" },
    update: {},
    create: { id: "burger-cat-3", restaurantId: restaurant.id, name: "Напитки", sortOrder: 3 },
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catBurgers.id,
    name: "Классический бургер",
    description: "Булочка бриошь, говядина 150 г, сыр, салат и соус.",
    price: 39900,
    weight: 280,
    image: "https://picsum.photos/seed/classic-burger/400/300",
    isPopular: true,
    options: [
      { name: "Прожарка", items: [{ name: "Медиум", priceDelta: 0 }, { name: "Хорошо прожарено", priceDelta: 0 }] },
      { name: "Добавки", items: [{ name: "Бекон", priceDelta: 8000 }, { name: "Двойной сыр", priceDelta: 5000 }] },
    ],
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catBurgers.id,
    name: "Дабл чизбургер",
    description: "Две котлеты, много сыра, солёные огурцы и горчица.",
    price: 54900,
    weight: 360,
    image: "https://picsum.photos/seed/double-burger/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catBurgers.id,
    name: "Чикен бургер",
    description: "Куриное филе в панировке, салат, помидор и майонез.",
    price: 35900,
    weight: 260,
    image: "https://picsum.photos/seed/chicken-burger/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catSnacks.id,
    name: "Картофель фри",
    description: "Хрустящий, с солью. Порция 150 г.",
    price: 14900,
    weight: 150,
    image: "https://picsum.photos/seed/fries/400/300",
    options: [{ name: "Соус", items: [{ name: "Кетчуп", priceDelta: 0 }, { name: "Сырный", priceDelta: 3000 }, { name: "Барбекю", priceDelta: 3000 }] }],
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catSnacks.id,
    name: "Крылышки BBQ",
    description: "6 штук, соус барбекю, слегка копчёные.",
    price: 39900,
    weight: 300,
    image: "https://picsum.photos/seed/wings/400/300",
  });

  await createDishWithOptions({
    restaurantId: restaurant.id,
    categoryId: catDrinks.id,
    name: "Лимонад 500 мл",
    description: "Домашний, с лимоном и мятой. Освежает.",
    price: 17900,
    image: "https://picsum.photos/seed/lemonade/400/300",
  });
}

type DishInput = {
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  weight?: number;
  image: string;
  isPopular?: boolean;
  options?: { name: string; items: { name: string; priceDelta: number }[] }[];
};

async function createDishWithOptions(input: DishInput): Promise<void> {
  const slug = input.name.toLowerCase().replace(/[^a-zа-я0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);

  const existing = await prisma.dish.findFirst({
    where: { restaurantId: input.restaurantId, name: input.name },
  });

  let dishId: string;
  if (existing) {
    await prisma.dish.update({
      where: { id: existing.id },
      data: {
        description: input.description,
        price: input.price,
        weight: input.weight,
        image: input.image,
        isPopular: input.isPopular ?? false,
        categoryId: input.categoryId,
      },
    });
    dishId = existing.id;
    await prisma.optionGroup.deleteMany({ where: { dishId } });
  } else {
    const dish = await prisma.dish.create({
      data: {
        restaurantId: input.restaurantId,
        categoryId: input.categoryId,
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        weight: input.weight,
        image: input.image,
        isPopular: input.isPopular ?? false,
        isAvailable: true,
      },
    });
    dishId = dish.id;
  }

  if (input.options) {
    for (const [idx, group] of input.options.entries()) {
      const g = await prisma.optionGroup.create({
        data: {
          dishId,
          name: group.name,
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          sortOrder: idx,
        },
      });
      for (const [j, item] of group.items.entries()) {
        await prisma.optionItem.create({
          data: {
            groupId: g.id,
            name: item.name,
            priceDelta: item.priceDelta,
            sortOrder: j,
          },
        });
      }
    }
  }
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
