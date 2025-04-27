const apiUrl = "https://darkgray-goshawk-731405.hostingersite.com"
                + "/crud-api/books_api.php";

function submitBook() {
    const form = document.getElementById("book_form");
    const title = document.querySelector("#title").value.trim();
    const author = document.querySelector("#author").value.trim();
    const genre = document.querySelector("#genre").value.trim();
    const publisher = document.querySelector("#publisher").value.trim();
    const publication_year = document.querySelector("#publication_year").
                                value.trim();

    if (!title || !author || !genre || !publisher || !publication_year) {
        alert("Please fill out all fields!");
        return;
    }

    fetch(apiUrl+"?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title,
            author: author,
            genre: genre,
            publisher: publisher,
            publication_year: publication_year
        })
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        form.reset();
        fetchBooks();
    })
    .catch(error => console.error("Error:", error));
}

function fetchBooks() {
    fetch(apiUrl+"?action=read")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(books => {
        console.log("Received books:", books);
        const booksList = document.getElementById("books_list");
        booksList.innerHTML = "";
        
        if (books.length === 0) {
            booksList.innerHTML = `
                        <tr>
                            <td colspan="7" style="text-align: center;">
                                No books found in database
                            </td>
                        </tr>`;
            return;
        }
        
        books.forEach(book => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${book.title || ''}</td>
                <td>${book.author || ''}</td>
                <td>${book.genre || ''}</td>
                <td>${book.publisher || ''}</td>
                <td>${book.publication_year || ''}</td>
                <td>
                    <button class="edit-btn" onclick="editRow(this)">
                        Edit
                    </button>
                </td>
                <td>
                    <button class="delete-btn" 
                                    onclick="deleteBook('${book.title.replace
                                    (/'/g, "\\'")}')">
                            Delete
                    </button>
                </td>
            `;
            booksList.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Error fetching books:", error);
        document.getElementById("books_list").innerHTML = 
            `<tr>
                <td colspan="7" style="text-align: center; color: red;">
                    Error loading books: ${error.message}
                </td>
            </tr>`;
    });
}

function deleteBook(title) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
        fetch(apiUrl+"?action=delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `title=${encodeURIComponent(title)}`
        })
        .then(response => response.text())
        .then(responseText => {
            alert(responseText);
            fetchBooks();
        })
        .catch(error => console.error("Error:", error));
    }
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

    button.style.display = "none";

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

    const [new_title, author, genre, publisher, publication_year] = updatedData;

    fetch(apiUrl+"?action=update", {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `original_title=${encodeURIComponent(originalData[0])}`
            +`&title=${encodeURIComponent(new_title)}`
            +`&author=${encodeURIComponent(author)}`
            +`&genre=${encodeURIComponent(genre)}`
            +`&publisher=${encodeURIComponent(publisher)}`
            +`&publication_year=${encodeURIComponent(publication_year)}`
    })
    .then(response => response.text())
    .then(responseText => {
        alert(responseText);
        fetchBooks();
    })
    .catch(error => console.error("Error:", error));
}

function cancelEdit(row, originalData) {
    const cells = row.querySelectorAll("td");
    for (let i = 0; i < 5; i++) {
        cells[i].innerText = originalData[i];
    }
    fetchBooks();
}

window.onload = fetchBooks();