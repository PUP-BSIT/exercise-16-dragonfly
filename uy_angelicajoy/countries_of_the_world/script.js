const searchInput = document.getElementById("search_input");
const searchButton = document.getElementById("search_button");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const countryDetails = document.getElementById("country_details");
const regionCountries = document.getElementById("region_countries");
const initialMessage = document.getElementById("initial_message");

const countryFlag = document.getElementById("country_flag");
const countryCommonName = document.getElementById("country_common_name");
const countryOfficialName = document.getElementById("country_official_name");
const countryCapital = document.getElementById("country_capital");
const countryRegion = document.getElementById("country_region");
const countryPopulation = document.getElementById("country_population");
const countryLanguages = document.getElementById("country_languages");
const countryCurrencies = document.getElementById("country_currencies");
const countryArea = document.getElementById("country_area");

const regionTitle = document.getElementById("region_title");
const countriesGrid = document.getElementById("countries_grid");

// Set initial state
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
    initialMessage.classList.add("active");
});

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatLanguages(languages) {
    if (!languages) return "N/A";
    return Object.values(languages).join(", ");
}

function formatCurrencies(currencies) {
    if (!currencies) return "N/A";
    return Object.values(currencies)
        .map((currency) => `${currency.name} (${currency.symbol || ""})`)
        .join(", ");
}

function setUIState(state) {
    // Reset all states first
    initialMessage.classList.remove("active");
    loadingElement.classList.remove("active");
    errorElement.classList.remove("active");
    countryDetails.classList.remove("active");
    regionCountries.classList.remove("active");

    // Set the current state
    switch (state) {
        case "initial":
            initialMessage.classList.add("active");
            break;
        case "loading":
            loadingElement.classList.add("active");
            break;
        case "error":
            errorElement.classList.add("active");
            break;
        case "results":
            countryDetails.classList.add("active");
            regionCountries.classList.add("active");
            break;
    }
}

// Display country details
function displayCountryDetails(country) {
    countryFlag.src = country.flags.svg || country.flags.png;
    countryFlag.alt = `Flag of ${country.name.common}`;

    countryCommonName.textContent = country.name.common;
    countryOfficialName.textContent = country.name.official;

    countryCapital.textContent = country.capital ? country.capital[0] : "N/A";
    countryRegion.textContent = country.subregion
        ? `${country.region} (${country.subregion})`
        : country.region;
    countryPopulation.textContent = formatNumber(country.population);
    countryLanguages.textContent = formatLanguages(country.languages);
    countryCurrencies.textContent = formatCurrencies(country.currencies);
    countryArea.textContent = country.area
        ? `${formatNumber(country.area)} km²`
        : "N/A";
}

// Display countries from the same region
function displayRegionCountries(regionData, currentCountryCode, regionName) {
    countriesGrid.innerHTML = "";

    regionTitle.textContent = `Other Countries in ${regionName}`;

    // Filter out current country and limit to 5 countries
    const otherCountries = regionData
        .filter((country) => country.cca3 !== currentCountryCode)
        .slice(0, 5);

    otherCountries.forEach((country) => {
        const countryCard = document.createElement("div");
        countryCard.className = "country-card";
        countryCard.innerHTML = `
            <img src="${country.flags.svg || country.flags.png}" alt="Flag of ${
            country.name.common
        }">
            <h3>${country.name.common}</h3>
        `;

        countryCard.addEventListener("click", () => {
            searchInput.value = country.name.common;
            searchCountry(country.name.common);
        });

        countriesGrid.appendChild(countryCard);
    });
}

// Search for a country
function searchCountry(countryName) {
    setUIState("loading");

    // First API request: Search for the country
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    "Country not found! Please try another search term."
                );
            }
            return response.json();
        })
        .then((countryData) => {
            const country = countryData[0];

            // Display country details
            displayCountryDetails(country);

            // Extract region for second API request
            const region = country.region;

            // Second API request: Get countries from the same region
            return fetch(`https://restcountries.com/v3.1/region/${region}`)
                .then((regionResponse) => {
                    if (!regionResponse.ok) {
                        throw new Error("Could not load region data.");
                    }
                    return regionResponse.json();
                })
                .then((regionData) => {
                    displayRegionCountries(regionData, country.cca3, region);
                    setUIState("results");
                });
        })
        .catch((error) => {
            errorElement.textContent = error.message;
            setUIState("error");
        });
}

searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        searchCountry(query);
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key !== "Enter") return;
    const query = searchInput.value.trim();

    if (!query) return;
    searchCountry(query);
});
