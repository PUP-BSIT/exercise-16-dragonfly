let searchInput = document.getElementById("search_input");
let searchButton = document.getElementById("search_button");
let loadingElement = document.getElementById("loading");
let errorElement = document.getElementById("error");
let countryDetails = document.getElementById("country_details");
let regionCountries = document.getElementById("region_countries");
let initialMessage = document.getElementById("initial_message");

let countryFlag = document.getElementById("country_flag");
let countryCommonName = document.getElementById("country_common_name");
let countryOfficialName = document.getElementById("country_official_name");
let countryCapital = document.getElementById("country_capital");
let countryRegion = document.getElementById("country_region");
let countryPopulation = document.getElementById("country_population");
let countryLanguages = document.getElementById("country_languages");
let countryCurrencies = document.getElementById("country_currencies");
let countryArea = document.getElementById("country_area");

let regionTitle = document.getElementById("region_title");
let countriesGrid = document.getElementById("countries_grid");

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

    countryDetails.style.display = "block";
}

// Display countries from the same region
function displayRegionCountries(regionData, currentCountryCode, regionName) {
    countriesGrid.innerHTML = "";

    regionTitle.textContent = `Other Countries in ${regionName}`;

    // Filter out current country and limit to 5 countries
    let otherCountries = regionData
        .filter((country) => country.cca3 !== currentCountryCode)
        .slice(0, 5);

    otherCountries.forEach((country) => {
        let countryCard = document.createElement("div");
        countryCard.className = "country-card";
        countryCard.innerHTML = `
                    <img src="${
                        country.flags.svg || country.flags.png
                    }" alt="Flag of ${country.name.common}">
                    <h3>${country.name.common}</h3>
                `;

        countryCard.addEventListener("click", () => {
            searchInput.value = country.name.common;
            searchCountry(country.name.common);
        });

        countriesGrid.appendChild(countryCard);
    });

    regionCountries.style.display = "block";
}

// Search for a country
function searchCountry(countryName) {
    initialMessage.style.display = "none";
    loadingElement.style.display = "block";
    errorElement.style.display = "none";
    countryDetails.style.display = "none";
    regionCountries.style.display = "none";

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
            let country = countryData[0];

            // Display country details
            displayCountryDetails(country);

            // Extract region for second API request
            let region = country.region;

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
                });
        })
        .catch((error) => {
            errorElement.textContent = error.message;
            errorElement.style.display = "block";
            initialMessage.style.display = "block";
        })
        .finally(() => {
            loadingElement.style.display = "none";
        });
}

searchButton.addEventListener("click", () => {
    let query = searchInput.value.trim();
    if (query) {
        searchCountry(query);
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        let query = searchInput.value.trim();
        if (query) {
            searchCountry(query);
        }
    }
});
