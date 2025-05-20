const http = require("http");
const fs = require("fs");
const path = require("path");
const requests = require("requests");

const homeFile = fs.readFileSync(path.join(__dirname, "home.html"), "utf-8");

// Time formatting function
const getFormattedDateTime = (timezoneOffsetInSeconds) => {
  const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
  const cityTime = new Date(nowUTC.getTime() + timezoneOffsetInSeconds * 1000);

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const day = days[cityTime.getUTCDay()];
  const date = cityTime.getUTCDate();
  const month = months[cityTime.getUTCMonth()];
  const hours = cityTime.getUTCHours();
  const minutes = cityTime.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHour = (hours % 12) || 12;

  return `${day} | ${month} ${date} | ${formattedHour}:${minutes}${ampm}`;
};

// Replace placeholders in HTML
const replaceVal = (template, weatherData) => {
  let result = template.replace(/{%tempval%}/g, weatherData.main?.temp || "");
  result = result.replace(/{%tempmin%}/g, weatherData.main?.temp_min || "");
  result = result.replace(/{%tempmax%}/g, weatherData.main?.temp_max || "");
  result = result.replace(/{%location%}/g, weatherData.name || "");
  result = result.replace(/{%country%}/g, weatherData.sys?.country || "");
  result = result.replace(/{%tempStatus%}/g, weatherData.weather?.[0]?.main || "");

  const timezoneOffset = weatherData.timezone || 0;
  const localDateTime = getFormattedDateTime(timezoneOffset);
  result = result.replace(/{%localdatetime%}/g, localDateTime);

  return result;
};

// Server
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    const city = "Vadodara";
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c381dde9bbc6ede6f518d55a75b3c31e&units=metric`;

    requests(apiURL)
      .on("data", (chunk) => {
        const data = JSON.parse(chunk);
        if (data.cod !== 200) {
          res.writeHead(404);
          res.end("<h2>City not found.</h2>");
          return;
        }

        const realTimeData = replaceVal(homeFile, data);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(realTimeData);
      })
      .on("end", (err) => {
        if (err) {
          console.error("Error: ", err);
          res.end("Error fetching data.");
        }
      });

  } else if (req.url === "/weather.css") {
    fs.readFile(path.join(__dirname, "weather.css"), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("CSS not found");
      } else {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(data);
      }
    });

  } else if (req.url === "/home.js") {
    fs.readFile(path.join(__dirname, "home.js"), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("JS not found");
      } else {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    });

  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});