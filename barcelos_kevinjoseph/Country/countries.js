document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const elements = {
        searchInput: document.getElementById('country_search'),
        searchBtn: document.getElementById('search_btn'),
        countryDetails: document.getElementById('country_details'),
        regionCountries: document.getElementById('region_countries'),
        loading: document.getElementById('loading'),
        errorMessage: document.getElementById('error_message'),
        
        // Country details elements
        flag: document.getElementById('flag'),
        countryName: document.getElementById('country_name'),
        officialName: document.getElementById('official_name'),
        capital: document.getElementById('capital'),
        region: document.getElementById('region'),
        population: document.getElementById('population'),
        languages: document.getElementById('languages'),
        area: document.getElementById('area'),
        
        // Region elements
        regionTitle: document.getElementById('region_title'),
        regionGrid: document.getElementById('region_grid')
    };
    
    // Constants
    const API_URL = 'https://restcountries.com/v3.1';
    
    // Event listeners
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSearch();
    });
    
    //Handle search button click
    function handleSearch() {
        const query = elements.searchInput.value.trim();
        
        if (!query) {
            showError('Please enter a country name');
            return;
        }
        
        searchCountry(query);
    }
    
    // Search for a country by name
    function searchCountry(query) {
        resetUI();
        showLoading();
        
        // First API call to search by country name
        fetch(`${API_URL}/name/${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) throw new Error('Country not found');
                return response.json();
            })
            .then(countries => {
                const country = countries[0];
                displayCountryDetails(country);
                // Get region and make second API call
                if (country.region) {
                    return fetchRegionCountries(country.region);
                }
            })
            .catch(error => {
                showError(error.message);
                hideLoading();
            });
    }
    
    // Fetch countries in the same region (second API call)
    function fetchRegionCountries(regionName) {
        return fetch(`${API_URL}/region/${encodeURIComponent(regionName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch countries`
                                   + ` in ${regionName}`);
                }
                return response.json();
            })
            .then(countries => {
                displayRegionCountries(regionName, countries);
                hideLoading();
            })
            .catch(error => {
                console.error('Error fetching region countries:', error);
                hideLoading();
            });
    }
    
    // Display country details in the UI
    function displayCountryDetails(country) {
        // Set flag
        elements.flag.src = country.flags?.png || '';
        elements.flag.alt = `Flag of ${country.name.common}`;
        // Set country names
        elements.countryName.textContent = country.name.common;
        elements.officialName.textContent = country.name.official;
        // Set capital
        elements.capital.textContent = country.capital?.join(', ') || 'N/A';
        // Set region
        elements.region.textContent = `${country.region}${
            country.subregion ? ` (${country.subregion})` : ''}`;
        // Set population
        elements.population.textContent = formatNumber(country.population || 0);
        // Set languages
        const languageList = country.languages ? 
            Object.values(country.languages).join(', ') : 'N/A';
        elements.languages.textContent = languageList;
        // Set area
        elements.area.textContent = country.area ? 
            `${formatNumber(country.area)} km²` : 'N/A';
        // Show the details section
        showElement(elements.countryDetails);
    }
    
    // Display countries in the same region
    function displayRegionCountries(regionName, countries) {
        elements.regionTitle.textContent = `Other Countries in ${regionName}`;
        elements.regionGrid.innerHTML = '';
        // Sort countries by name
        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        // Create cards for each country (limited to 36)
        const displayCount = Math.min(countries.length, 36);
        
        for (let i = 0; i < displayCount; i++) {
            const country = countries[i];
            const card = document.createElement('div');
            card.className = 'region-card';
            
            // Add click event
            card.addEventListener('click', () => {
                elements.searchInput.value = country.name.common;
                searchCountry(country.name.common);
                window.scrollTo({top: 0, behavior: 'smooth'});
            });
            
            // Add flag
            const flagImg = document.createElement('img');
            flagImg.className = 'region-flag';
            flagImg.src = country.flags?.png || '';
            flagImg.alt = `Flag of ${country.name.common}`;
            
            // Add country name
            const nameElement = document.createElement('div');
            nameElement.className = 'region-name';
            nameElement.textContent = country.name.common;
            
            // Add capital if available
            if (country.capital && country.capital.length > 0) {
                const capitalElement = document.createElement('div');
                capitalElement.textContent = country.capital[0];
                card.appendChild(flagImg);
                card.appendChild(nameElement);
                card.appendChild(capitalElement);
            } else {
                card.appendChild(flagImg);
                card.appendChild(nameElement);
            }
            
            elements.regionGrid.appendChild(card);
        }
        
        showElement(elements.regionCountries);
    }
    
    // UI Helper functions
    function resetUI() {
        hideElement(elements.countryDetails);
        hideElement(elements.regionCountries);
        hideElement(elements.errorMessage);
    }
    
    function showLoading() {
        showElement(elements.loading);
    }
    
    function hideLoading() {
        hideElement(elements.loading);
    }
    
    function showElement(element) {
        element.classList.remove('hide');
    }
    
    function hideElement(element) {
        element.classList.add('hide');
    }
    
    function showError(message) {
        elements.errorMessage.textContent = message;
        showElement(elements.errorMessage);
    }
    
    function formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
});