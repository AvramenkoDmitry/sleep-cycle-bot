import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import { format } from "date-fns";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);
const prisma = new PrismaClient();

bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) {
    await prisma.user.upsert({
      where: { telegramId: userId },
      update: {},
      create: { telegramId: userId },
    });
  }

  console.log(`User ${userId} started the bot.`);
  ctx.reply(
    "Привет! Я бот для трекинга сна. Выбери количество циклов сна для лёгкого пробуждения.",
    Markup.inlineKeyboard([
      [Markup.button.callback("4 цикла", "4")],
      [Markup.button.callback("5 циклов", "5")],
      [Markup.button.callback("6 циклов", "6")],
    ])
  );
});

// Обработка выбора количества циклов сна
bot.action(/^[456]$/, async (ctx) => {
  const data = "data" in ctx.callbackQuery ? ctx.callbackQuery.data : null;
  if (!data) {
    await ctx.answerCbQuery("Ошибка: нет данных.");
    return;
  }

  const cycleCount = parseInt(data, 10);
  const userId = ctx.from!.id;
  const now = new Date();
  const wakeUpTime = new Date(now.getTime() + cycleCount * 90 * 60 * 1000);
  const wakeUpTimeStr = format(wakeUpTime, "HH:mm");

  await prisma.user.upsert({
    where: { telegramId: userId },
    update: { cycleCount },
    create: { telegramId: userId, cycleCount },
  });

  const user = await prisma.user.findUnique({ where: { telegramId: userId } });
  await prisma.sleepRecord.create({
    data: {
      userId: user!.id,
      cycleCount,
      startTime: now,
      wakeUpTime,
      confirmed: false,
    },
  });

  await ctx.answerCbQuery();
  await ctx.reply(
    `Запомнил! Ты выбрал ${cycleCount} циклов. Тебе нужно встать в ${wakeUpTimeStr}. Спи крепко! 😴\n\nЛожишься сейчас спать?`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Да", "confirm_sleep")],
      [Markup.button.callback("Нет", "decline_sleep")],
    ])
  );
});

// Подтверждение сна
bot.action("confirm_sleep", async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from!.id;
  const user = await prisma.user.findUnique({ where: { telegramId: userId } });
  const record = await prisma.sleepRecord.findFirst({
    where: { userId: user!.id, confirmed: false },
    orderBy: { startTime: "desc" },
  });

  if (!record) {
    return ctx.reply("Нечего подтверждать.");
  }

  await prisma.sleepRecord.update({
    where: { id: record.id },
    data: { confirmed: true },
  });

  await ctx.reply("Отлично, сон подтверждён. Спокойной ночи! 🌙");
});

// Отказ от сна
bot.action("decline_sleep", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    "Понял, запись о сне не подтверждена. Можешь подтвердить позже."
  );
});

bot.launch().then(() => {
  console.log("Bot is running...");
});
