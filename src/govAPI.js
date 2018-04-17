const rp = require("request-promise");
const API = "https://booking.uz.gov.ua/ru";

const suggestCityCache = {};

async function suggestCity(term) {
  if (suggestCityCache[term]) {
    return suggestCityCache[term];
  }
  const uri = `${API}/train_search/station/?term=${encodeURIComponent(term)}`;
  console.log(uri);
  const options = { method: "GET", uri };
  const result = await rp(options);
  const jsonResult = JSON.parse(result);
  suggestCityCache[term] = jsonResult;
  return jsonResult;
}

async function checkTrain(trainData) {
  const options = {
    method: "POST",
    uri: `${API}/train_search/`,
    formData: {
      from: trainData.from,
      to: trainData.to,
      date: trainData.date,
      time: trainData.time || "00:00"
    }
  };
  const result = await rp(options);
  return JSON.parse(result);
}

function ticketLink(ticket) {
  return `https://booking.uz.gov.ua/ru/?from=${ticket.from}&to=${
    ticket.to
  }&date=${ticket.date}&time=${encodeURIComponent(ticket.time)}&url=train-list`;
}
module.exports = { suggestCity, checkTrain, ticketLink };
