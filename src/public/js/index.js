// Initialize Socket.IO connection
const socket = io({
    auth: {
        token: localStorage.getItem('authToken')
    }
});

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


const username = prompt('Type your Username:') || ''; 

socket.emit('username', username);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    if (input.value) {
        socket.emit('chatMessage', input.value, token);
        input.value = '';
    }
});

buttonClearMessage.addEventListener('click', () => {
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }
});

exportButton.addEventListener('click', () => {
    window.location.href = '/export';
});

socket.on('chatMessage', (msg) => {
    const li = document.createElement('li');
    li.textContent = msg;
    messages.appendChild(li);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on('updateUserList', (data) => {
    userList.innerHTML = '';
    userTotal.innerHTML = data.numbusers;
    data.users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
});

socket.on('authToken', (token) => {
    localStorage.setItem('authToken', token);
});