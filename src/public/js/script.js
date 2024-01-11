// Socket.IO connection
const socket = io({
    auth: {
        token: localStorage.getItem('authToken')
    }
})

const userList = document.getElementById('userList');
const messages = document.getElementById('messages');
const buttonClearMessage = document.getElementById('clearMessage');


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


/* Socket Functions */

const username = prompt('Type your Username:'); 

if (username) {
    socket.emit('username', username.trim());
}
else {
    socket.emit('usernameEmpty');
}

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

