const { cmd, deleteMessage } = require("../telegramAPI");
const { suggestCity, checkTrain } = require("../govAPI");

const STAGE0_QUESTION = "Отведь мне, откуда будем ехадь?";
const STAGE1_QUESTION = "Выбериде конгредный пункт:";
const STAGE2_QUESTION = "Отведь мне, куда будем ехадь?";
const STAGE4_QUESTION = "Отведь мне, Когда будем ехадь? Формат - ГГГГ-ММ-ДД";
const STAGE5_QUESTION = "Выбериде боизд:";

class WatchDialog {
  constructor(chatId, resultCb) {
    this.chatId = chatId;
    this.resultCb = resultCb;
    this.stage = 0;
    this.done = false;
    this.stage0();
    this.stage1 = this.stage1.bind(this);
    this.data = { options: {} };
  }

  async stage0() {
    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: STAGE0_QUESTION
    });
    this.stage = 1;
  }

  async stage1(msg) {
    if (msg.reply_to_message.text !== STAGE0_QUESTION) {
      return;
    }
    this.data.rawFrom = msg.text;
    const result = await suggestCity(msg.text);
    const inlineKeyboard = result.map(({ title, value }) => {
      return [
        {
          text: title,
          callback_data: JSON.stringify({
            dialog: "watch",
            action: "from",
            value
          })
        }
      ];
    });
    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: STAGE1_QUESTION,
      reply_markup: JSON.stringify({ inline_keyboard: inlineKeyboard })
    });
    this.stage = 2;
  }

  async stage2(msg, data) {
    if (msg.text !== STAGE1_QUESTION) {
      return;
    }
    if (!data || data.dialog !== "watch" || data.action !== "from") {
      return;
    }
    this.data.from = data.value;
    await deleteMessage(this.chatId, msg.message_id);
    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: STAGE2_QUESTION
    });
    this.stage = 3;
  }

  async stage3(msg) {
    if (msg.reply_to_message.text !== STAGE2_QUESTION) {
      return;
    }
    this.data.rawTo = msg.text;
    const result = await suggestCity(msg.text);
    const inlineKeyboard = result.map(({ title, value }) => {
      return [
        {
          text: title,
          callback_data: JSON.stringify({
            dialog: "watch",
            action: "to",
            value
          })
        }
      ];
    });
    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: STAGE1_QUESTION,
      reply_markup: JSON.stringify({ inline_keyboard: inlineKeyboard })
    });
    this.stage = 4;
  }

  async stage4(msg, data) {
    if (msg.text !== STAGE1_QUESTION) {
      return;
    }
    if (!data || data.dialog !== "watch" || data.action !== "to") {
      return;
    }
    this.data.to = data.value;
    await deleteMessage(this.chatId, msg.message_id);
    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: STAGE4_QUESTION
    });
    this.stage = 5;
  }

  async stage5(msg) {
    if (msg.reply_to_message.text !== STAGE4_QUESTION) {
      return;
    }
    this.data.date = msg.text;
    const result = await checkTrain(
      {
        from: this.data.from,
        to: this.data.to,
        date: this.data.date
      },
      false
    );

    this.trainCache = result.data.list;
    if (result.data.list.length === 0) {
      await cmd("sendMessage", {
        chat_id: this.chatId,
        text: "По такому набравлению поездов нинашол"
      });
      this.stage = 0;
      this.done = true;
      this.resultCb();
      return;
    }
    const inlineKeyboard = result.data.list.map(train => {
      return [
        {
          text: `${train.num} ${train.from.time} - ${train.to.time}`,
          callback_data: JSON.stringify({
            dialog: "watch",
            action: "train",
            value: train.num
          })
        }
      ];
    });

    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: STAGE5_QUESTION,
      reply_markup: JSON.stringify({ inline_keyboard: inlineKeyboard })
    });
    this.stage = 6;
  }

  async stage6(msg, data) {
    if (!data || data.dialog !== "watch" || data.action !== "train") {
      return;
    }
    if (data.value) {
      this.data.options.trains = [data.value];
    }
    let fromTitle = this.data.rawFrom;
    let toTitle = this.data.rawTo;
    const cacheTrain = this.trainCache.find(({ num }) => num === data.value);
    if (cacheTrain) {
      fromTitle = cacheTrain.from.stationTrain;
      toTitle = cacheTrain.to.stationTrain;
    }
    this.resultCb(null, {
      from: this.data.from,
      fromTitle: fromTitle,
      toTitle: toTitle,
      to: this.data.to,
      date: this.data.date,
      chatId: this.chatId,
      options: this.data.options
    });
    await deleteMessage(this.chatId, msg.message_id);
    await cmd("sendMessage", {
      chat_id: this.chatId,
      text: `Будем искать билеты ${this.data.rawFrom} - ${this.data.rawTo} на ${
        this.data.date
      }. Поезда - ${this.data.options.trains.join(", ")}`
    });
    this.done = true;
  }
}

module.exports = WatchDialog;
