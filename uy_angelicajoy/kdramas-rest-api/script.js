const apiUrl =
    "https://darkgray-goshawk-731405.hostingersite.com/crud-api/kdramas_api.php";

function submitKdrama() {
    const form = document.getElementById("kdrama_form");
    const title = document.querySelector("#title").value.trim();
    const main_lead = document.querySelector("#main_lead").value.trim();
    const release_year = document.querySelector("#release_year").value.trim();
    const episodes = document.querySelector("#episodes").value.trim();
    const genre = document.querySelector("#genre").value.trim();
    const network = document.querySelector("#network").value.trim();
    const rating = document.querySelector("#rating").value.trim();
    const completed = document.querySelector("#completed").value.trim();

    if (
        !title ||
        !main_lead ||
        !release_year ||
        !episodes ||
        !genre ||
        !network ||
        !rating ||
        !completed
    ) {
        alert("Please fill out all fields!");
        return;
    }

    // Print the exact URL being used for debugging
    console.log("Submitting to: " + apiUrl + "?action=create");

    fetch(apiUrl + "?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
            `title=${encodeURIComponent(title)}` +
            `&main_lead=${encodeURIComponent(main_lead)}` +
            `&release_year=${encodeURIComponent(release_year)}` +
            `&episodes=${encodeURIComponent(episodes)}` +
            `&genre=${encodeURIComponent(genre)}` +
            `&network=${encodeURIComponent(network)}` +
            `&rating=${encodeURIComponent(rating)}` +
            `&completed=${encodeURIComponent(completed)}`,
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(
                        `Server responded with ${response.status}: ${text}`
                    );
                });
            }
            return response.text();
        })
        .then((responseText) => {
            alert(responseText);
            form.reset(); // Reset form after successful submit
            fetchKdramas();
        })
        .catch((error) => {
            console.error("Submission Error:", error);
            alert("Error adding K-drama: " + error.message);
        });
}

function fetchKdramas() {
    console.log("Fetching from: " + apiUrl + "?action=read");

    fetch(apiUrl + "?action=read")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then((kdramas) => {
            displayKdramas(kdramas);
        })
        .catch((error) => {
            console.error("Error fetching K-dramas:", error);
            document.getElementById("kdramas_list").innerHTML =
                "<tr><td colspan='10'>Error loading K-dramas. Please try again later.</td></tr>";
        });
}

function displayKdramas(kdramas) {
    const kdramasList = document.getElementById("kdramas_list");
    kdramasList.innerHTML = "";

    if (kdramas.length === 0) {
        kdramasList.innerHTML =
            "<tr><td colspan='10'>No K-dramas found. Add some!</td></tr>";
        return;
    }

    kdramas.forEach((kdrama) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${kdrama.title || ""}</td>
            <td>${kdrama.main_lead || ""}</td>
            <td>${kdrama.release_year || ""}</td>
            <td>${kdrama.episodes || ""}</td>
            <td>${kdrama.genre || ""}</td>
            <td>${kdrama.network || ""}</td>
            <td>${kdrama.rating || ""}</td>
            <td>${kdrama.completed || ""}</td>
            <td>
                <button class="edit-btn" onclick="editRow(this)">
                    Edit
                </button>
            </td>
            <td>
                <button 
                        class="delete-btn" 
                        onclick="deleteKdrama('${kdrama.title}')">
                    Delete
                </button>
            </td>
        `;
        kdramasList.appendChild(row);
    });
}

function editRow(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");

    const originalData = [];

    // Save original data and replace cells with input fields
    for (let i = 0; i < 8; i++) {
        const cellText = cells[i].innerText || "";
        originalData.push(cellText);

        // Create different input types based on the cell
        if (i === 2 || i === 3) {
            // Year and episodes - number input
            cells[i].innerHTML = `<input type="number" value="${cellText}" />`;
        } else if (i === 4) {
            // Genre - dropdown
            cells[i].innerHTML = createGenreDropdown(cellText);
        } else if (i === 5) {
            // Network - dropdown
            cells[i].innerHTML = createNetworkDropdown(cellText);
        } else if (i === 6) {
            // Rating - number input
            cells[
                i
            ].innerHTML = `<input type="number" min="0" max="10" step="0.1" value="${cellText}" />`;
        } else if (i === 7) {
            // Status - dropdown
            cells[i].innerHTML = createStatusDropdown(cellText);
        } else {
            // Text inputs for other fields
            cells[i].innerHTML = `<input type="text" value="${cellText}" />`;
        }
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

function createGenreDropdown(selectedValue) {
    const genres = [
        "Romance",
        "Comedy",
        "Action",
        "Thriller",
        "Historical",
        "Fantasy",
        "Slice of Life",
        "Melodrama",
    ];
    return createDropdown(genres, selectedValue);
}

function createNetworkDropdown(selectedValue) {
    const networks = [
        "Netflix",
        "tvN",
        "SBS",
        "KBS",
        "JTBC",
        "MBC",
        "Disney+",
        "Other",
    ];
    return createDropdown(networks, selectedValue);
}

function createStatusDropdown(selectedValue) {
    const statuses = ["Completed", "Watching", "Plan to Watch", "Dropped"];
    return createDropdown(statuses, selectedValue);
}

function createDropdown(options, selectedValue) {
    let html = "<select>";
    options.forEach((option) => {
        const selected = option === selectedValue ? "selected" : "";
        html += `<option value="${option}" ${selected}>${option}</option>`;
    });
    html += "</select>";
    return html;
}

function saveRow(row, originalData) {
    const inputs = row.querySelectorAll("input, select");
    const updatedData = Array.from(inputs).map((input) => input.value.trim());

    if (updatedData.some((val) => val === "")) {
        alert("Please fill out all fields!");
        return;
    }

    const [
        new_title,
        main_lead,
        release_year,
        episodes,
        genre,
        network,
        rating,
        completed,
    ] = updatedData;

    console.log("Updating drama with data:", {
        originalTitle: originalData[0],
        newData: updatedData,
    });

    fetch(apiUrl + "?action=update", {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
            `original_title=${encodeURIComponent(originalData[0])}` +
            `&title=${encodeURIComponent(new_title)}` +
            `&main_lead=${encodeURIComponent(main_lead)}` +
            `&release_year=${encodeURIComponent(release_year)}` +
            `&episodes=${encodeURIComponent(episodes)}` +
            `&genre=${encodeURIComponent(genre)}` +
            `&network=${encodeURIComponent(network)}` +
            `&rating=${encodeURIComponent(rating)}` +
            `&completed=${encodeURIComponent(completed)}`,
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(
                        `Server responded with ${response.status}: ${text}`
                    );
                });
            }
            return response.text();
        })
        .then((responseText) => {
            alert(responseText);
            fetchKdramas();
        })
        .catch((error) => {
            console.error("Update Error:", error);
            alert("Error updating K-drama: " + error.message);
        });
}

function cancelEdit(row, originalData) {
    const cells = row.querySelectorAll("td");
    for (let i = 0; i < 8; i++) {
        cells[i].innerText = originalData[i];
    }
    fetchKdramas();
}

function deleteKdrama(title) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
        fetch(apiUrl + "?action=delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `title=${encodeURIComponent(title)}`,
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(
                            `Server responded with ${response.status}: ${text}`
                        );
                    });
                }
                return response.text();
            })
            .then((responseText) => {
                alert(responseText);
                fetchKdramas();
            })
            .catch((error) => {
                console.error("Delete Error:", error);
                alert("Error deleting K-drama: " + error.message);
            });
    }
}

function applyFilters() {
    const genreFilter = document.getElementById("filter_genre").value;
    const networkFilter = document.getElementById("filter_network").value;
    const statusFilter = document.getElementById("filter_status").value;

    fetch(apiUrl + "?action=read")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then((kdramas) => {
            // Apply filters
            const filteredKdramas = kdramas.filter((kdrama) => {
                return (
                    (genreFilter === "" || kdrama.genre === genreFilter) &&
                    (networkFilter === "" ||
                        kdrama.network === networkFilter) &&
                    (statusFilter === "" || kdrama.completed === statusFilter)
                );
            });

            displayKdramas(filteredKdramas);
        })
        .catch((error) => {
            console.error("Filter Error:", error);
        });
}

function resetFilters() {
    document.getElementById("filter_genre").value = "";
    document.getElementById("filter_network").value = "";
    document.getElementById("filter_status").value = "";
    fetchKdramas();
}

window.onload = fetchKdramas();
