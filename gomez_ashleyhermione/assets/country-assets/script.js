document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("search_btn");

    if (searchBtn) {
        searchBtn.addEventListener("click", searchCountry);
    }
});

async function searchCountry() {
    const countryInput = document.getElementById("country_input").value.trim();
    const result = document.getElementById("result");
    const regionBox = document.getElementById("region");

    result.innerHTML = "";
    regionBox.innerHTML = "";

    if (!countryInput) {
        alert("Please enter a country name.");
        return;
    }

    try {
        const countryData = await fetchCountryData(countryInput);

        renderCountryInfo(countryData, result);

        const otherCountries = await fetchCountriesByRegion(
            countryData.region,
            countryData.name
        );

        renderRegionCountries(otherCountries, regionBox, countryData.region);
    } catch (error) {
        result.classList.add("error-message");
        result.textContent = error.message;

        console.error(error);
    }
}

async function fetchCountryData(name) {
    const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Country not found!");
    }

    const data = await response.json();

    const match =
        data.find((c) => c.name.common.toLowerCase() === name.toLowerCase()) ||
        data[0];

    const {
        name: { common: countryName },
        capital,
        region,
        languages,
        currencies,
        population,
        flags,
    } = match;

    return {
        name: countryName,
        capital: capital?.[0] || "N/A",
        region,
        languages: languages ? Object.values(languages).join(", ") : "N/A",
        currency: currencies ? Object.values(currencies)[0].name : "N/A",
        population: population?.toLocaleString() || "N/A",
        flag: flags.svg,
    };
}

async function fetchCountriesByRegion(region, excludeCountryName) {
    const response = await fetch(
        `https://restcountries.com/v3.1/region/${encodeURIComponent(region)}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch region data.");
    }

    const data = await response.json();

    return data.filter(
        (c) => c.name.common.toLowerCase() !== excludeCountryName.toLowerCase()
    );
}

function renderCountryInfo(info, container) {
    container.innerHTML = `
      <h2>${info.name}</h2>
      <p><strong>Capital:</strong> ${info.capital}</p>
      <p><strong>Languages:</strong> ${info.languages}</p>
      <p><strong>Currency:</strong> ${info.currency}</p>
      <p><strong>Region:</strong> ${info.region}</p>
      <p><strong>Population:</strong> ${info.population}</p>
      <img src="${info.flag}" class="flag" alt="Flag of ${info.name}" />
    `;
}

function renderRegionCountries(countries, container, region) {
    container.innerHTML = `<h3>Other countries in ${region}:</h3>`;

    countries.forEach((c) => {
        const el = document.createElement("span");
        el.classList.add("region-country");
        el.textContent = c.name.common;
        container.appendChild(el);
    });
}
