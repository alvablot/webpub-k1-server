const days = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];
const months = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];
function getDateStamp() {
  const now = new Date();
  const year = now.getYear();
  const month = now.getMonth();
  const day = now.getDay();
  const date = now.getDate();
  const hour = now.getHours();
  let minute = now.getMinutes();
  if (minute < 10) minute = "0" + minute;
  let second = now.getSeconds();
  if (second < 10) second = "0" + second;
  const dateStamp = `${days[day]} ${date} ${months[month]} ${
    year + 1900
  } Kl ${hour}:${minute}:${second}`;
  return dateStamp;
}

module.exports = getDateStamp;