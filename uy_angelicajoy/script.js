let commentName = document.getElementById("name");
let commentText = document.getElementById("comment");
let commentBtn = document.getElementById("comment-button");
let sortSelect = document.getElementById("sort_comments");

function buttonState() {
    let isFilled = commentName.value.trim() && commentText.value.trim();
    commentBtn.disabled = !isFilled;
}

commentName.addEventListener("input", buttonState);
commentText.addEventListener("input", buttonState);

// Set up comment submission
commentBtn.addEventListener("click", (event) => {
    event.preventDefault(); 
    let nameValue = commentName.value.trim();
    let textValue = commentText.value.trim();
    
    if (!nameValue || !textValue) {
        console.error("Both fields must be filled.");
        return;
    }
    
    addComment(nameValue, textValue);
    
    // Reset the form
    commentName.value = "";
    commentText.value = "";
    buttonState();
});

// Function to add a new comment to the page
function addComment(name, text) {
    let commentDiv = document.createElement("div");
    commentDiv.classList.add("team-comment");
    
    let timestamp = new Date();
    let timestampText = `(${timestamp.toLocaleString()})`;
    
    let nameElement = document.createElement("h4");
    nameElement.textContent = name;
    nameElement.classList.add("font-2");
    
    let textElement = document.createElement("p");
    textElement.textContent = `-${text}`;
    
    let timestampElement = document.createElement("small");
    timestampElement.textContent = timestampText;
    
    commentDiv.appendChild(nameElement);
    commentDiv.appendChild(textElement);
    commentDiv.appendChild(timestampElement);
    
    let commentForm = document.querySelector(".comment-form");
    commentForm.parentNode.insertBefore(commentDiv, commentForm);
    
    sortComments();
}

// Function to sort comments
function sortComments() {
    let allComments = Array.from(document.querySelectorAll(".team-comment"));
    let sortOrder = sortSelect.value; 
    
    // Sort comments based on timestamp
    allComments.sort((a, b) => {
        let extractTimestamp = (element) => {
            let smallElement = element.querySelector("small");
            if (!smallElement) return 0; 
            let text = smallElement.textContent;
            return new Date(text.replace(/[()]/g, '')); 
        };
        
        let timeA = extractTimestamp(a);
        let timeB = extractTimestamp(b);
        
        return sortOrder === "latest" ? timeB - timeA : timeA - timeB;
    });
    
    let commentFormElement = document.querySelector(".comment-form");
    let parentElement = commentFormElement.parentNode;
    
    allComments.forEach(comment => parentElement.removeChild(comment));
    
    allComments.forEach(comment => {
        parentElement.insertBefore(comment, commentFormElement);
    });
}

sortSelect.addEventListener("change", sortComments);

let contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("Thank you for your message! I'll get back to you soon.");
    contactForm.reset();
});