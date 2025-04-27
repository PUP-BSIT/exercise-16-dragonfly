const apiUrl = "https://darkgray-goshawk-731405.hostingersite.com/"
                + "crud-api/movies_api.php";

function submitMovie() {
    const form = document.getElementById("movie_form");
    const title = document.querySelector("#title").value.trim();
    const director = document.querySelector("#director").value.trim();
    const release_year = document.querySelector("#release_year").value.trim();
    const genre = document.querySelector("#genre").value.trim();
    const rating = document.querySelector("#rating").value.trim();

    if (!title || !director || !release_year || !genre || !rating) {
        alert("Please fill out all fields!");
        return;
    }

    fetch(apiUrl+"?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `title=${encodeURIComponent(title)}`
            + `&director=${encodeURIComponent(director)}`
            + `&release_year=${encodeURIComponent(release_year)}`
            + `&genre=${encodeURIComponent(genre)}`
            + `&rating=${encodeURIComponent(rating)}`
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        form.reset(); // Reset form after successful submit
        fetchMovies();
    })
    .catch(error => console.error("Error:", error));
}

function fetchMovies() {
    fetch(apiUrl+"?action=read")
    .then(response => response.json())
    .then(movies => {
        const moviesList = document.getElementById("movies_list");
        moviesList.innerHTML = "";
        console.log(movies); // Log the movies data for debugging
        movies.forEach(movie => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${movie.title}</td>
                <td>${movie.director}</td>
                <td>${movie.release_year}</td>
                <td>${movie.genre}</td>
                <td>${movie.rating}</td>
                <td>
                    <button class="edit-btn" onclick="editRow(this)">
                        Edit
                    </button>
                </td>
                <td>
                    <button 
                            class="delete-btn" 
                            onclick="deleteMovie('${movie.title}')">
                        Delete
                    </button>
                </td>
            `;
            moviesList.appendChild(row);
        });
    });
}

function editRow(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");

    const originalData = [];
    for (let i = 0; i < 5; i++) {
        originalData.push(cells[i].innerText);
        cells[i].innerHTML = `<input type="text" 
                                    value="${cells[i].innerText}" />`;
    }

    button.className = "hide";

    const saveBtn = document.createElement("button");
    saveBtn.className = "edit-btn";
    saveBtn.textContent = "Save";
    saveBtn.onclick = () => saveRow(row, originalData);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "delete-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = () => cancelEdit(row, originalData);

    button.parentNode.appendChild(saveBtn);
    button.parentNode.appendChild(cancelBtn);
}

function saveRow(row, originalData) {
    const inputs = row.querySelectorAll("input");
    const updatedData = Array.from(inputs).map(input => input.value.trim());

    if (updatedData.some(val => val === "")) {
        alert("Please fill out all fields!");
        return;
    }

    const [new_title, director, release_year, genre, rating] = updatedData;

    fetch(apiUrl+"?action=update", {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `original_title=${encodeURIComponent(originalData[0])}`
            + `&title=${encodeURIComponent(new_title)}`
            + `&director=${encodeURIComponent(director)}`
            + `&release_year=${encodeURIComponent(release_year)}`
            + `&genre=${encodeURIComponent(genre)}`
            + `&rating=${encodeURIComponent(rating)}`
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        fetchMovies();
    })
    .catch(error => console.error("Error:", error));
}

function cancelEdit(row, originalData) {
    const cells = row.querySelectorAll("td");
    for (let i = 0; i < 5; i++) {
        cells[i].innerText = originalData[i];
    }
    fetchMovies();
}

function deleteMovie(title) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
        fetch(apiUrl+"?action=delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `title=${encodeURIComponent(title)}`
        })
        .then(response => response.text())
        .then(responseText => {
            alert(responseText);
            fetchMovies();
        })
        .catch(error => console.error("Error:", error));
    }
}

window.onload = fetchMovies();