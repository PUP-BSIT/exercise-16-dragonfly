document.addEventListener("DOMContentLoaded", initializeCommentSection);

function initializeCommentSection() {
    let commentBtn = document.getElementById("submit_comment");
    commentBtn.disabled = true;

    let userName = document.getElementById("name");
    let userComment = document.getElementById("comment");
    let sortBtn = document.createElement("button");
    let commentContainer = document.getElementById("comments_section");

    let ascendingOrder = true;
    let storedComments = [
        {
            name: "Kevin Barcelos",
            text:
                "Wow, very artistic goals. Please teach me how to" +
                " design my website. I would like to learn from you.",
            timestamp: new Date(2025, 2, 19, 9, 0, 0),
        },
        {
            name: "Angelica Joy Uy",
            text:
                "I'm excited to see your progress in coding and design." +
                "Keep it up!",
            timestamp: new Date(2025, 2, 19, 10, 0, 0),
        },
        {
            name: "Gener Andaya Jr.",
            text:
                "These are great goals! Keep pushing your creativity and" +
                " sharpening your skills—you're on the path to excellence!",
            timestamp: new Date(2025, 2, 19, 11, 0, 0),
        },
    ];

    function updateButtonState() {
        commentBtn.disabled = !(
            userName.value.trim() && userComment.value.trim()
        );
    }

    function addNewComment(event) {
        event.preventDefault();
        let nameValue = userName.value.trim();
        let commentValue = userComment.value.trim();

        if (nameValue && commentValue) {
            storedComments.push({
                name: nameValue,
                text: commentValue,
                timestamp: new Date(),
            });
            userName.value = "";
            userComment.value = "";
            updateButtonState();
            displayComments();
        }
    }

    function formatTimestamp(date) {
        return date.toLocaleString();
    }

    function displayComments() {
        commentContainer.innerHTML = "";
        let sortedComments = [...storedComments].sort((a, b) =>
            ascendingOrder
                ? a.timestamp - b.timestamp
                : b.timestamp - a.timestamp
        );

        sortedComments.forEach((c) => {
            let commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");

            let author = document.createElement("h3");
            author.textContent = c.name;

            let message = document.createElement("p");
            message.textContent = c.text;

            let time = document.createElement("p");
            time.classList.add("comment-timestamp");
            time.textContent = formatTimestamp(c.timestamp);

            commentDiv.appendChild(author);
            commentDiv.appendChild(message);
            commentDiv.appendChild(time);
            commentContainer.appendChild(commentDiv);
        });
    }

    function toggleSortOrder() {
        ascendingOrder = !ascendingOrder;
        sortBtn.textContent = `Sort by Date ${ascendingOrder ? "↑" : "↓"}`;
        displayComments();
    }

    userName.addEventListener("input", updateButtonState);
    userComment.addEventListener("input", updateButtonState);
    commentBtn.addEventListener("click", addNewComment);

    sortBtn.textContent = "Sort by Date ↑";
    sortBtn.id = "sort_button";
    sortBtn.addEventListener("click", toggleSortOrder);

    commentContainer.parentElement.insertBefore(sortBtn, commentContainer);
    displayComments();
}