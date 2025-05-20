const http = require("http");
const fs = require("fs");
const path = require("path");
const requests = require("requests");
const url = require("url");

const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempVal, orgVal, errorMessage = "") => {
    let temperature = tempVal.replace("{%tempval%}", orgVal.main?.temp || "");
    temperature = temperature.replace("{%tempmin%}", orgVal.main?.temp_min || "");
    temperature = temperature.replace("{%tempmax%}", orgVal.main?.temp_max || "");
    temperature = temperature.replace("{%location%}", orgVal.name || "");
    temperature = temperature.replace("{%country%}", orgVal.sys?.country || "");
    temperature = temperature.replace("{%tempStatus%}", orgVal.weather?.[0]?.main || "");
    temperature = temperature.replace("{%errorMessage%}", errorMessage);
    return temperature;
};


const server = http.createServer((req, res) => {
    console.log("Request received for URL:", req.url);

    // ✅ Serve CSS
    if (req.url === "/weather.css") {
        fs.readFile("weather.css", (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("CSS file not found");
            } else {
                res.writeHead(200, { "Content-Type": "text/css" });
                res.end(data);
            }
        });
    }

    // ✅ Serve JS
    else if (req.url === "/home.js") {
        fs.readFile("home.js", (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("JS file not found");
            } else {
                res.writeHead(200, { "Content-Type": "application/javascript" });
                res.end(data);
            }
        });
    }

    // ✅ Serve HTML with weather data
    // else if (req.url === "/") {
    //     console.log("Making API request...");

    //     requests("https://api.openweathermap.org/data/2.5/weather?q=Vadodara&appid=c381dde9bbc6ede6f518d55a75b3c31e&units=metric")
    //         .on("data", (chunk) => {
    //             console.log("Data chunk received");

    //             const objdata = JSON.parse(chunk);
    //             console.log("Parsed Data:", objdata);

    //             if (objdata.cod !== 200) {
    //                 res.writeHead(500, { "Content-Type": "text/plain" });
    //                 res.end("Error fetching weather: " + objdata.message);
    //                 return;
    //             }

    //             const arrData = [objdata];
    //             const realTimeData = arrData.map((val) => replaceVal(homeFile, val)).join("");

    //             res.writeHead(200, { "Content-Type": "text/html" });
    //             res.end(realTimeData);
    //         })
    //         .on("end", (err) => {
    //             console.log("End of data");

    //             if (err) {
    //                 console.log("Error: ", err);
    //                 res.end("Something went wrong!");
    //             }
    //         });

    else if (req.url.startsWith("/?city=") || req.url === "/") {
        const parsedUrl = url.parse(req.url, true);
        const queryCity = parsedUrl.query.city || "Vadodara";
        const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&appid=c381dde9bbc6ede6f518d55a75b3c31e&units=metric`;

       requests(apiURL)
       .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);

        // ✅ Check if API returned an error (e.g., city not found)
      if (!objdata.main || objdata.cod != 200) {
    const errorPage = replaceVal(homeFile, {
        main: {},
        sys: {},
        weather: [{}],
        name: "",
    }, `City not found: ${queryCity}`);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(errorPage);
    return;
}
       const realTimeData = replaceVal(homeFile, objdata, "");
       res.writeHead(200, { "Content-Type": "text/html" });
       res.end(realTimeData);
    })
    .on("end", (err) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Something went wrong!");
        }
    });
}

    // ❌ Fallback for unknown routes
    else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
});

server.listen(8000, "127.0.0.1", () => {
    console.log("Server is running at http://127.0.0.1:8000");
});