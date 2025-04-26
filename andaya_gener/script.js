const nameInput = document.getElementById('name');
const commentInput = document.getElementById('comment');
const commentButton = document.getElementById('comment_button');
const commentForm = document.getElementById('comment_form');
const commentsSection = document.getElementById('comments_section');
const sortAscendingButton = document.getElementById('sort_by_date_ascending');
const sortDescendingButton = document.getElementById('sort_by_date_descending');

// Function to toggle the button state
function toggleButtonState() {
    commentButton.disabled = !(
        nameInput.value.trim() && commentInput.value.trim()
    );
}

// Function to add a new comment
function addComment(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    const currentDate = new Date().toISOString();
    const formattedDate = new Date(currentDate).toLocaleString();

    if (name && comment) {
        const newComment = document.createElement('p');
        newComment.textContent = `${comment} - ${name} (${formattedDate})`;
        newComment.dataset.date = currentDate; // Store raw date for sorting
        commentsSection.querySelector('.asset').appendChild(newComment);
    }

    nameInput.value = '';
    commentInput.value = '';
    toggleButtonState();
}

// Function to update the display of existing comments with date-time
function updateCommentDisplay() {
    const comments = commentsSection.querySelectorAll('.asset p');
    comments.forEach(comment => {
        const commentDate = new Date(comment.dataset.date).toLocaleString();
        if (!comment.textContent.includes('(')) { // Prevent duplicate date-time
            comment.textContent += ` (${commentDate})`;
        }
    });
}

// Function to sort comments by date while preserving the heading
function sortComments(order) {
    const asset = commentsSection.querySelector('.asset');
    const heading = asset.querySelector('h3');
    const comments = [...asset.children]
        .filter(comment => comment.tagName === 'P');

    // Sort the comments by date
    const sortedComments = comments.sort((firstComment, secondComment) => {
        const firstCommentDate = new Date(firstComment.dataset.date);
        const secondCommentDate = new Date(secondComment.dataset.date);
        return order === 'ascending_order'
            ? firstCommentDate - secondCommentDate 
            : secondCommentDate - firstCommentDate;
    });

    // Clear only the comments, keeping the heading
    asset.innerHTML = ''; 
    asset.appendChild(heading);
    sortedComments.forEach(comment => asset.appendChild(comment));
}

// Call the function to update existing comments
updateCommentDisplay();

// Event listeners for sorting buttons
sortAscendingButton.addEventListener(
    'click', () => sortComments('ascending_order')
);

sortDescendingButton.addEventListener(
    'click', () => sortComments('descending_order')
);

// Add event listeners to input fields and to the form for the submit action
nameInput.addEventListener('input', toggleButtonState);
commentInput.addEventListener('input', toggleButtonState);
commentForm.addEventListener('submit', addComment);