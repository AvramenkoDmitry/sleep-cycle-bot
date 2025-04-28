"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const dotenv_1 = __importDefault(require("dotenv"));
const date_fns_1 = require("date-fns");
dotenv_1.default.config();
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => {
    var _a;
    console.log(`User ${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id} started the bot.`);
    ctx.reply("Привет! Я бот для трекинга сна. Выбери количество циклов сна для лёгкого пробуждения.", telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback("4 цикла", "4")],
        [telegraf_1.Markup.button.callback("5 циклов", "5")],
        [telegraf_1.Markup.button.callback("6 циклов", "6")],
    ]));
});
bot.on("callback_query", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const callbackQuery = ctx.callbackQuery; // Уточняем тип callbackQuery
    const data = callbackQuery.data;
    if (data) {
        const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
        if (data === "4" || data === "5" || data === "6") {
            const cycleCount = parseInt(data, 10);
            const now = new Date();
            const wakeUpTime = new Date(now.getTime() + cycleCount * 90 * 60 * 1000);
            const wakeUpTimeStr = (0, date_fns_1.format)(wakeUpTime, "HH:mm");
            yield ctx.answerCbQuery();
            yield ctx.reply(`Запомнил! Ты выбрал ${cycleCount} циклов. Тебе нужно встать в ${wakeUpTimeStr}. Спи крепко! 😴`);
            console.log(`Cycle count ${cycleCount} saved for user ${userId}. Wake up time: ${wakeUpTimeStr}.`);
        }
        else {
            yield ctx.answerCbQuery("Пожалуйста, выбери количество циклов.");
        }
    }
    else {
        yield ctx.answerCbQuery("Ошибка: нет данных в запросе.");
    }
}));
bot.launch().then(() => {
    console.log("Bot is running...");
});
