let commentButton = document.getElementById("comment_button");
commentButton.disabled = true;
let nameInput = document.getElementById("name_input");
let messageInput = document.getElementById("message_input");
let sortOrderAscending = true;
let commentsArray = [
    {
        name: "Ashley Hermione Gomez",
        comment: "Nice goals! Hope you get to explore amazing places.",
        timestamp: new Date(2025, 2, 19, 9, 0, 0)
    },
    {
        name: "Angelica Joy Uy",
        comment: "Great goals! They'll bring new skills, experience"
                    + " growth. Exciting journey ahead!",
        timestamp: new Date(2025, 2, 19, 10, 0, 0)
    },
    {
        name: "Gener Andaya Jr.",
        comment: "Your goals are amazing and full of growth. Keep striving,"
                    + " and step by step, you'll achieve them all!",
        timestamp: new Date(2025, 2, 19, 11, 0, 0)
    }
];

// Comment Button Functionality
nameInput.addEventListener("input", toggleCommentButtonState);
messageInput.addEventListener("input", toggleCommentButtonState);
function toggleCommentButtonState() {
    let isNameFilled = nameInput.value.trim();
    let isMessageFilled = messageInput.value.trim();
    commentButton.disabled = !(isNameFilled && isMessageFilled);
    renderComments();
}

commentButton.addEventListener("click", function (event) {
    event.preventDefault();
    let name = nameInput.value.trim();
    let comment = messageInput.value.trim();
    if (name && comment) {
        addComment(name, comment);
    }
});

// Sort button functionality
let sortButton = document.getElementById("sort_button");
sortButton.addEventListener("click", toggleSortOrder);
function toggleSortOrder() {
    sortOrderAscending = !sortOrderAscending;
    sortButton.textContent = `Sort by Date ${sortOrderAscending ? "↑" : "↓"}`;
    renderComments();
}

// Add comment to the array and render it
function addComment(name, comment) {
    commentsArray.push({
        name: name,
        comment: comment,
        timestamp: new Date()
    });

    nameInput.value = "";
    messageInput.value = "";
    toggleCommentButtonState();
    renderComments();
}

// Date Formatter
function formatDate(date) {
    return date.toLocaleString();
}

// Show current sort order of the comments
function renderComments() {
    commentsArray.sort((a, b) => {
        if (sortOrderAscending) {
            return a.timestamp - b.timestamp;
        } else {
            return b.timestamp - a.timestamp;
        }
    });

    let teamCommentSection = document.querySelector(".member-comments");
    teamCommentSection.innerHTML = "";

    commentsArray.forEach((comment) => {
        let commentWrapper = document.createElement("div");
        commentWrapper.classList.add("user-comment");

        let nameElement = document.createElement("h4");
        nameElement.classList.add("font-2");
        nameElement.textContent = comment.name;

        let commentElement = document.createElement("p");
        commentElement.textContent = "- " + comment.comment;

        let timestampElement = document.createElement("p");
        timestampElement.classList.add("comment-timestamp");
        timestampElement.textContent = formatDate(comment.timestamp);

        commentWrapper.appendChild(nameElement);
        commentWrapper.appendChild(commentElement);
        commentWrapper.appendChild(timestampElement);

        teamCommentSection.appendChild(commentWrapper);
    });
}

// Call initialization on page load
document.addEventListener("DOMContentLoaded", renderComments);