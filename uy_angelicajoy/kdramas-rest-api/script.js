const API_URL = "https://darkgray-goshawk-731405.hostingersite.com"
                + "/crud-api/kdrama_api.php";
let allDramas = [];
let sortField = "rating";
let sortDirection = "desc";

// Helper function to safely parse JSON
function safeJsonParse(str) {
    try {
        if (Array.isArray(str)) return str;
        if (typeof str === "string") {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [str];
        }
        return [];
    } catch (e) {
        console.error("Error parsing JSON:", e);
        return typeof str === "string"
            ? str.split(",").map((s) => s.trim())
            : [];
    }
}

// Display message
function showMessage(type, message) {
    const messageDiv = document.getElementById("error_message");
    messageDiv.textContent = message;
    messageDiv.className = "message active " + type;
    setTimeout(
        () => {
            messageDiv.className = "message";
        },
        type === "error" ? 5000 : 3000
    );
}

// Show error message
function showError(message) {
    showMessage("error", message);
}

// Show success message
function showSuccess(message) {
    showMessage("success", message);
}

// Load dramas on page load
document.addEventListener("DOMContentLoaded", fetchDramas);

// Set sort direction
function setSortDirection(direction) {
    sortDirection = direction;
    document
        .getElementById("sort_asc")
        .classList.toggle("active", direction === "asc");
    document
        .getElementById("sort_desc")
        .classList.toggle("active", direction === "desc");
    renderDramas();
}

// Sort dramas by the selected field
function sortDramas() {
    sortField = document.getElementById("sort_field").value;
    renderDramas();
}

// Fetch dramas from API
async function fetchDramas() {
    const genre = document.getElementById("filter_genre").value;
    const minRating = document.getElementById("filter_rating").value;

    let url = API_URL;
    const params = [];

    if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
    if (minRating) params.push(`minRating=${encodeURIComponent(minRating)}`);

    if (params.length > 0) {
        url += "?" + params.join("&");
    }

    // Clear drama list before fetching
    document.getElementById("drama_list").innerHTML = "";

    // Show a simple text indicator instead of loading spinner
    const loadingText = document.createElement("p");
    loadingText.className = "loading-text";
    loadingText.textContent = "Loading dramas...";
    document.getElementById("drama_list").appendChild(loadingText);

    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        allDramas = await response.json();
        renderDramas();
    } catch (error) {
        console.error("Error fetching dramas:", error);
        showError("Error fetching dramas. Please try again.");
        // Show error state in drama list
        document.getElementById("drama_list").innerHTML = `
            <div class="error-state">
                <p>Failed to load dramas. Please try again.</p>
                <button onclick="fetchDramas()">Retry</button>
            </div>
        `;
    }
}

// Render dramas with current sort and filter
function renderDramas() {
    const dramaList = document.getElementById("drama_list");
    dramaList.innerHTML = "";

    if (allDramas.length === 0) {
        dramaList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <p>No dramas found matching your criteria.</p>
                <button onclick="resetFilters()">
                    <i class="fas fa-undo"></i> 
                        Reset Filters
                </button>
            </div>
        `;
        return;
    }

    const sortedDramas = [...allDramas].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === "title") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        } else if (typeof aValue !== "number") {
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
        }

        return sortDirection === "asc"
            ? aValue > bValue
                ? 1
                : -1
            : aValue < bValue
            ? 1
            : -1;
    });

    sortedDramas.forEach((drama) => {
        const castMembers = safeJsonParse(drama.main_cast);
        const rating = parseFloat(drama.rating);
        const formattedRating = !isNaN(rating) ? rating.toFixed(1) : "N/A";
        const isCompleted = drama.is_completed === "complete";

        const dramaCard = document.createElement("div");
        dramaCard.className = "drama-card";
        dramaCard.innerHTML = `
            <div class="rating">
                <i class="fas fa-star"></i> ${formattedRating}
            </div>
            <h3>${drama.title} (${drama.year_released})</h3>
            <div class="drama-info">
                <div class="drama-meta">
                    <span><i class="fas fa-film"></i> ${drama.genre}</span>
                    <span><i class="fas fa-tv"></i> 
                    ${drama.episode_count} eps</span>
                </div>
                <div class="cast-list">
                    <strong><i class="fas fa-users"></i> Cast:</strong> 
                    ${castMembers.join(", ")}
                </div>
                <span class="status ${isCompleted ? "completed" : "ongoing"}">
                    ${
                        isCompleted
                            ? '<i class="fas fa-check-circle"></i> Completed'
                            : '<i class="fas fa-spinner"></i> Ongoing'
                    }
                </span>
            </div>
            <div class="card-actions">
                <button class="edit" onclick="editDrama('${drama.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete" onclick="deleteDrama('${drama.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        dramaList.appendChild(dramaCard);
    });
}

// Reset filters
function resetFilters() {
    document.getElementById("filter_genre").value = "";
    document.getElementById("filter_rating").value = "";
    fetchDramas();
}

// Add new drama
async function addDrama() {
    const newDrama = {
        title: document.getElementById("title").value,
        yearReleased: parseInt(document.getElementById("year").value),
        episodeCount: parseInt(document.getElementById("episodes").value),
        mainCast: document
            .getElementById("cast")
            .value.split(",")
            .map((s) => s.trim()),
        genre: document.getElementById("genre").value,
        rating: parseFloat(document.getElementById("rating").value),
        isCompleted: document.getElementById("status").value === "1",
    };

    // Show add operation is in progress
    const submitBtn = document.querySelector(
        '#drama_form button[type="submit"]'
    );
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDrama),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to add drama");
        }

        document.getElementById("drama_form").reset();
        showSuccess("Drama added successfully!");
        fetchDramas();
    } catch (error) {
        console.error("Error adding drama:", error);
        showError("Error adding drama: " + error.message);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Delete drama
async function deleteDrama(id) {
    if (!confirm("Are you sure you want to delete this drama?")) return;

    // Find the delete button that was clicked and show deletion in progress
    const deleteBtn = document.querySelector(
        `button.delete[onclick="deleteDrama('${id}')"]`
    );
    const originalBtnText = deleteBtn.innerHTML;
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    deleteBtn.disabled = true;

    try {
        const response = await fetch(
            `${API_URL}?id=${encodeURIComponent(id)}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to delete drama");
        }

        showSuccess("Drama deleted successfully!");
        fetchDramas();
    } catch (error) {
        console.error("Error deleting drama:", error);
        showError("Error deleting drama: " + error.message);

        // Restore button state since the item wasn't deleted
        deleteBtn.innerHTML = originalBtnText;
        deleteBtn.disabled = false;
    }
}

// Create a modal for editing dramas
function createEditModal(drama) {
    // Check if modal already exists and remove it
    const existingModal = document.getElementById("edit_modal");
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal container
    const modal = document.createElement("div");
    modal.id = "edit_modal";
    modal.className = "modal";

    // Parse cast if needed
    const castMembers = safeJsonParse(drama.main_cast);
    const castString = Array.isArray(castMembers)
        ? castMembers.join(", ")
        : drama.main_cast;

    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Drama</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="edit_drama_form">
                    <div class="form-group">
                        <label for="edit_title">Title:</label>
                        <input type="text" 
                            id="edit_title" 
                            value="${drama.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_year">Year Released:</label>
                        <input type="number" 
                            id="edit_year" 
                            min="2000" 
                            max="2025" 
                            value="${drama.year_released}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_episodes">Episode Count:</label>
                        <input type="number" 
                            id="edit_episodes" 
                            min="1" 
                            value="${drama.episode_count}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_cast">
                            Main Cast (comma separated):
                        </label>
                        <input type="text" 
                            id="edit_cast" 
                            value="${castString}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_genre">Genre:</label>
                        <select id="edit_genre" required>
                            <option value="Romance" ${
                                drama.genre === "Romance" ? "selected" : ""
                                }>Romance
                            </option>
                            <option value="Thriller" ${
                                drama.genre === "Thriller" ? "selected" : ""
                                }>Thriller
                            </option>
                            <option value="Historical" ${
                                drama.genre === "Historical" ? "selected" : ""
                                }>Historical
                            </option>
                            <option value="Comedy" ${
                                drama.genre === "Comedy" ? "selected" : ""
                                }>Comedy
                            </option>
                            <option value="Fantasy" ${
                                drama.genre === "Fantasy" ? "selected" : ""
                                }>Fantasy
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit_rating">Rating (1-10):</label>
                        <input type="number" 
                            id="edit_rating" 
                            min="1" max="10" 
                            step="0.1" 
                            value="${drama.rating}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_status">Series Status:</label>
                        <select id="edit_status" required>
                            <option value="1" ${
                                drama.is_completed === "complete"
                                    ? "selected"
                                    : ""
                            }>Completed</option>
                            <option value="0" ${
                                drama.is_completed === "on going"
                                    ? "selected"
                                    : ""
                            }>Ongoing</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button id="save_changes" class="save">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button id="cancel_edit" class="cancel">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Add event listeners
    document.querySelector(".close-modal").addEventListener("click", () => {
        modal.remove();
    });

    document.getElementById("cancel_edit").addEventListener("click", () => {
        modal.remove();
    });

    document
        .getElementById("save_changes")
        .addEventListener("click", async () => {
            // Change button state to show saving
            const saveBtn = document.getElementById("save_changes");
            const originalSaveBtnText = saveBtn.innerHTML;
            saveBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;

            try {
                await saveChanges(drama.id);
                modal.remove();
            } catch (error) {
                // Restore button on error
                saveBtn.innerHTML = originalSaveBtnText;
                saveBtn.disabled = false;
            }
        });

    // Show modal
    modal.style.display = "block";
}

// Save edited drama changes
async function saveChanges(id) {
    const updatedDrama = {
        title: document.getElementById("edit_title").value,
        yearReleased: parseInt(document.getElementById("edit_year").value),
        episodeCount: parseInt(document.getElementById("edit_episodes").value),
        mainCast: document
            .getElementById("edit_cast")
            .value.split(",")
            .map((s) => s.trim()),
        genre: document.getElementById("edit_genre").value,
        rating: parseFloat(document.getElementById("edit_rating").value),
        isCompleted: document.getElementById("edit_status").value === "1",
    };

    try {
        const response = await fetch(
            `${API_URL}?id=${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedDrama),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update drama");
        }

        showSuccess(`Updated "${updatedDrama.title}" successfully!`);
        fetchDramas();
    } catch (error) {
        console.error("Error updating drama:", error);
        showError("Error updating drama: " + error.message);
        throw error; // Rethrow to allow the caller to handle it
    }
}

// Edit drama - now opens a modal with all fields
function editDrama(id) {
    const drama = allDramas.find((d) => d.id === id);
    if (!drama) {
        showError("Drama not found");
        return;
    }

    createEditModal(drama);
}
