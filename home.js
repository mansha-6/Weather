const curDate = document.getElementById("date");
const weathercon = document.getElementById("weathercon");

const tempStatus = document.getElementById("tempStatus")?.innerText.trim() || "Clear";
const timezoneOffset = Number(document.getElementById("timezoneOffset")?.innerText || 0);

function isDayTime(offsetInSeconds) {
    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(nowUTC.getTime() + offsetInSeconds * 1000);
    const hour = localTime.getHours();
    return hour >= 6 && hour < 18;
}

function getFormattedDateTime(offsetInSeconds) {
    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(nowUTC.getTime() + offsetInSeconds * 1000);
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const day = days[localTime.getDay()];
    const date = localTime.getDate();
    const month = months[localTime.getMonth()];
    const hours = localTime.getHours();
    const minutes = localTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = (hours % 12) || 12;
    return `${day} | ${month} ${date} | ${formattedHour}:${minutes}${ampm}`;
}

// ✅ Log status for debugging
console.log("Weather status:", tempStatus);

const isDay = isDayTime(timezoneOffset);
let iconHTML;
const normalizedStatus = tempStatus.trim().toLowerCase();
console.log("Normalized Weather Status:", normalizedStatus);

switch (normalizedStatus) {
    case "clear":
        iconHTML = isDay
            ? "<i class='fas fa-sun' style='color:rgb(234, 184, 34);'></i>"
            : "<i class='fas fa-moon' style='color: #2f3542;'></i>";
        break;
    case "clouds":
        iconHTML = isDay
            ? "<i class='fas fa-cloud-sun' style='color: #dfe4ea;'></i>"       // 🌤️
            : "<i class='fas fa-cloud-moon' style='color: #a4b0be;'></i>";     // 🌥️
        break;
    case "rain":
    case "drizzle":
        iconHTML = "<i class='fas fa-cloud-showers-heavy' style='color: #a4b0be;'></i>";
        break;
    case "snow":
        iconHTML = "<i class='fas fa-snowflake' style='color: #00acee;'></i>";
        break;
    case "thunderstorm":
        iconHTML = "<i class='fas fa-bolt' style='color: #f39c12;'></i>";
        break;
    case "mist":
    case "haze":
    case "fog":
    case "smoke":
        iconHTML = "<i class='fas fa-smog' style='color: gray;'></i>";
        break;
    default:
        iconHTML = isDay
            ? "<i class='fas fa-sun' style='color: #eccc68;'></i>"
            : "<i class='fas fa-moon' style='color: #2f3542;'></i>";
        break;
}

if (weathercon) weathercon.innerHTML = iconHTML;

if (curDate && !isNaN(timezoneOffset)) {
    curDate.innerHTML = getFormattedDateTime(timezoneOffset);
} else {
    curDate.innerHTML = "Time not available";
}