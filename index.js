require("dotenv").config();
const fetch = require("node-fetch");
const { Telegraf, Markup } = require("telegraf");
const { transliterate: tr } = require("transliteration");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) =>
  ctx.replyWithMarkdown(
    `
Что может делать этот бот?

Введите название города,
и бот напишет, какая сейчас
погода в этом городе.
`,
    Markup.keyboard([["Киев"]])
      .resize()
      .extra()
  )
);
bot.help((ctx) =>
  ctx.replyWithMarkdown(`
Название города нужно вводить
на русском языке.
`)
);
bot.hears(/\w/g, (ctx) =>
  ctx.reply("Название города нужно вводить на русском языке.")
);
bot.hears(/[а-яё]/gi, async (ctx) => {
  try {
    const api = `http://api.openweathermap.org/data/2.5/weather?q=${tr(
      ctx.message.text
    )}&units=metric&appid=${process.env.API_KEY}&lang=ru`;
    const response = await fetch(api);
    const json = await response.json();
    const temp = await json.main;
    const weather = await json.weather;
    const wind = await json.wind;
    return ctx.replyWithMarkdown(`
    ${json.name}:
Температура:  ${Math.round(temp.temp)} °C
Ощущается как:  ${Math.round(temp.feels_like)} °C
Ветер:  ${Math.round(wind.speed)} м/с
${weather[0].description[0].toUpperCase() + weather[0].description.slice(1)}
    `);
  } catch (error) {
    return ctx.reply("Такого города не существует!");
  }
});

bot.launch();
