// 1. Helper: Formats Unix timestamp to HH:MM
function formatTime(timestamp) {
    let date = new Date(timestamp * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    return hours + ":" + minutes.substr(-2);
}

// 2. Constants
const apiKey = "a989c37791e71825e5d558708c757a7c";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

// 3. Selectors
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weathericon = document.querySelector(".weathericon");
const weatherDiv = document.querySelector(".weather");
const spinner = document.querySelector(".loading-spinner");
const forecastContainer = document.querySelector(".forecast");

// 4. Main Function
async function checkWeather(city) {
    if (!city) return;

    // UI Reset
    spinner.style.display = "block";
    weatherDiv.style.display = "none";
    document.querySelector(".error").style.display = "none";
    searchBtn.disabled = true;

    try {
        // Parallel fetching (Fastest way)
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(apiUrl + city + `&appid=${apiKey}`),
            fetch(forecastUrl + city + `&appid=${apiKey}`)
        ]);

        if (weatherRes.status == 404) {
            document.querySelector(".error").style.display = "block";
        } else {
            const data = await weatherRes.json();
            const forecastData = await forecastRes.json();

            // Populate Main Weather
            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
            document.querySelector(".feels-like").innerHTML = "Feels like: " + Math.round(data.main.feels_like) + "°c";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
            
            // Sunrise/Sunset
            const sunrise = formatTime(data.sys.sunrise);
            const sunset = formatTime(data.sys.sunset);
            document.querySelector(".sun-times").innerHTML = `${sunrise} / ${sunset}`;

            // Rain Probability from first forecast slot
            const rainProb = Math.round(forecastData.list[0].pop * 100);
            document.querySelector(".rain-chance").innerHTML = rainProb + "%";

            // Main Icon Logic
            const icons = {
                "Clouds": "images/clouds.png",
                "Clear": "images/clear.png",
                "Rain": "images/rain.png",
                "Drizzle": "images/drizzle.png",
                "Mist": "images/mist.png"
            };
            weathericon.src = icons[data.weather[0].main] || "images/clear.png";

            // Populate Forecast UI
            updateForecastUI(forecastData);

            weatherDiv.style.display = "block";
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    } finally {
        spinner.style.display = "none";
        searchBtn.disabled = false;
    }
}

// 5. Forecast UI Helper
function updateForecastUI(data) {
    forecastContainer.innerHTML = "";
    // Jump by 8 to get roughly the same time each day (24 hours later)
    for (let i = 0; i < data.list.length; i += 8) {
        const day = data.list[i];
        const date = new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' });
        
        forecastContainer.innerHTML += `
            <div class="forecast-item">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${Math.round(day.main.temp)}°</p>
            </div>`;
    }
}

// 6. Event Listeners
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});

// Initial Load
checkWeather("Karachi");