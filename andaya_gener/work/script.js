function searchCountry() {
    let countryName = document.getElementById("search_box").value.trim();
    let countryUrl = `https://restcountries.com/v3.1/name/${countryName}`;

    // First HTTP request to get country details and region
    fetch(countryUrl)
        .then(response => response.json())
        .then(data => {
            let countryData = data[0]; // Get the first matched country
            let region = countryData.region;

            // Display country details
            document.getElementById("country_name")
                .textContent = countryData.name.common;

            document.getElementById("capital")
                .textContent = countryData.capital[0];

            document.getElementById("region")
                .textContent = countryData.region;

            document.getElementById("population")
                .textContent = countryData.population;

            document.getElementById("area")
                .textContent = `${countryData.area} km²`;
                
            document.getElementById("currency")
                .textContent = Object.values(countryData.currencies)[0].name;

            // Clear previous error message if any
            document.getElementById("error_message").textContent = "";

            // Return the second fetch request for the region
            let regionUrl = `https://restcountries.com/v3.1/region/${region}`;
            return fetch(regionUrl);
        })

        // Display list of countries in the same region
        .then(response => response.json())
        .then(regionData => {
            let regionCountries = regionData
                .map(country => country.name.common).join(", ");

            document.getElementById("region_countries")
                .textContent = regionCountries;
        })

        .catch(error => {
            // Show error message when country is not found
            document.getElementById("error_message")
                .textContent = "Country not found. Please try again.";

            // Clear previous country details
            document.getElementById("country_name").textContent = "";
            document.getElementById("capital").textContent = "";
            document.getElementById("region").textContent = "";
            document.getElementById("population").textContent = "";
            document.getElementById("area").textContent = "";
            document.getElementById("currency").textContent = "";
            document.getElementById("region_countries").textContent = "";
        });
}