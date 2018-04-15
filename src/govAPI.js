const rp = require("request-promise");
const API = "https://booking.uz.gov.ua/ru";

async function suggestCity(term) {
  const uri = `${API}/train_search/station/?term=${encodeURIComponent(term)}`;
  console.log(uri);
  const options = { method: "GET", uri };
  const result = await rp(options);
  return JSON.parse(result);
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

module.exports = { suggestCity, checkTrain };
