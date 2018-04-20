const rp = require("request-promise");
const { tryReq } = require("proxymon");
const API = "https://booking.uz.gov.ua/ru";

const suggestCityCache = {};

async function suggestCity(term) {
  if (suggestCityCache[term]) {
    return suggestCityCache[term];
  }
  const uri = `${API}/train_search/station/?term=${encodeURIComponent(term)}`;
  const options = { method: "GET", uri };
  const result = await rp(options);
  const jsonResult = JSON.parse(result);
  suggestCityCache[term] = jsonResult;
  return jsonResult;
}

async function checkTrain(trainData, useProxy = true) {
  const options = {
    method: "POST",
    uri: `${API}/train_search/`,
    formData: {
      from: trainData.from,
      to: trainData.to,
      date: trainData.date,
      time: trainData.time || "00:00"
    },
    timeout: 2000
  };
  let result = null;
  if (useProxy) {
    result = await tryReq(options);
  } else {
    result = await rp(options);
  }
  return JSON.parse(result);
}

function ticketLink(ticket) {
  return `https://booking.uz.gov.ua/ru/?from=${ticket.from}&to=${
    ticket.to
  }&date=${ticket.date}&time=${encodeURIComponent(ticket.time)}&url=train-list`;
}

function ticketPlaceLink(ticket, trainNum, type) {
  return `https://booking.uz.gov.ua/ru/?from=${ticket.from}&to=${
    ticket.to
  }&date=${ticket.date}&time=${encodeURIComponent(
    ticket.time
  )}&train=${encodeURIComponent(trainNum)}&wagon_type_id=${encodeURIComponent(
    type
  )}&url=train-wagons`;
}

module.exports = { suggestCity, checkTrain, ticketLink, ticketPlaceLink };
