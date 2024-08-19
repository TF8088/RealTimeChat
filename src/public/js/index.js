// Initialize Socket.IO connection
const socket = io();

// DOM elements
const form = document.getElementById('form');
const input = document.getElementById('input');
const buttonSendMessage = document.getElementById('sendMessage');
const buttonClearMessage = document.getElementById('clearMessage');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');
const userTotal = document.getElementById('userTotal');
const chatContainer = document.getElementById('chat-container');
const exportButton = document.getElementById('exportButton');

// Prompt user for username
const username = prompt('Type your Username:');

// If a username is provided, emit 'username' event; otherwise, remove message input and display a notice
if (username) {
    socket.emit('username', username);
} else {
    buttonSendMessage.remove();
    input.innerHTML = 'Please Provide a Name! Press F5.';
    input.disable = true;
}

// Event listener for the form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // If the input has a value, emit 'chatMessage' event and clear the input
    if (input.value) {
        socket.emit('chatMessage', input.value);
        input.value = '';
    }
});

// Event listener for clearing messages
buttonClearMessage.addEventListener('click', () => {
    // Remove all child elements from the 'messages' element
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }
});

// Event listener for exporting messages
// exportButton.addEventListener('click', () => {
//     // Redirect to the '/export' route
//     window.location.href = '/export';
// });

// Event listener for handling incoming chat messages
socket.on('chatMessage', (msg) => {
    // Create a new list item and append the message to the 'messages' element
    const li = document.createElement('li');
    li.textContent = msg;
    messages.appendChild(li);
    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

// Event listener for updating the user list
socket.on('updateUserList', (data) => {
    // Clear the 'userList' element and update the total number of users
    userList.innerHTML = '';
    userTotal.innerHTML = data.numbusers;
    // Iterate over the array of users and append each to the 'userList' element
    data.users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
});
