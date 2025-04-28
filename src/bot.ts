import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import { format } from "date-fns";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx) => {
  console.log(`User ${ctx.from?.id} started the bot.`);
  ctx.reply(
    "Привет! Я бот для трекинга сна. Выбери количество циклов сна для лёгкого пробуждения.",
    Markup.inlineKeyboard([
      [Markup.button.callback("4 цикла", "4")],
      [Markup.button.callback("5 циклов", "5")],
      [Markup.button.callback("6 циклов", "6")],
    ])
  );
});

bot.on("callback_query", async (ctx) => {
  const callbackQuery = ctx.callbackQuery as { data: string }; // Уточняем тип callbackQuery
  const data = callbackQuery.data;

  if (data) {
    const userId = ctx.from?.id;

    if (data === "4" || data === "5" || data === "6") {
      const cycleCount = parseInt(data, 10);

      const now = new Date();
      const wakeUpTime = new Date(now.getTime() + cycleCount * 90 * 60 * 1000);
      const wakeUpTimeStr = format(wakeUpTime, "HH:mm");

      await ctx.answerCbQuery();
      await ctx.reply(
        `Запомнил! Ты выбрал ${cycleCount} циклов. Тебе нужно встать в ${wakeUpTimeStr}. Спи крепко! 😴`
      );

      console.log(
        `Cycle count ${cycleCount} saved for user ${userId}. Wake up time: ${wakeUpTimeStr}.`
      );
    } else {
      await ctx.answerCbQuery("Пожалуйста, выбери количество циклов.");
    }
  } else {
    await ctx.answerCbQuery("Ошибка: нет данных в запросе.");
  }
});

bot.launch().then(() => {
  console.log("Bot is running...");
});
