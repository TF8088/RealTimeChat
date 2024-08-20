// Required modules
const express = require('express');
const http = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const ejs = require('ejs');
const DOMPurify = require('dompurify'); // Sanitization library (to-do)
const fs = require('fs');
const crypto = require('crypto');

// Load environment variables from .env file
require('dotenv').config()

// Express app setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', join(__dirname, './public'));
app.use('/public', express.static(join(__dirname, './public')));

// Maps to store connected users and messages
const connectedUsers = new Map();
const messagesMap = new Map();
const privateChatsMap = new Map();

// Route to render the chat application
app.get('/', (req, res) => {
    res.render('index');
});

// Route to export chat messages
app.get('/export', (req, res) => {
    // Get the current time for timestamping exported messages
    const time = new Date();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const stringTime = `[${hours}:${formattedMinutes}:${seconds}]`;

    // Create an array of formatted messages
    const messagesArray = Array.from(messagesMap.values()).map(entry => `${stringTime} ${entry.username}: ${entry.message}`);
    
    // Combine messages into a single string
    const content = messagesArray.join('\n');

    // Define the file path for exported messages
    const filePath = join(__dirname, 'exported_messages.txt');

    // Write messages to a file
    fs.writeFileSync(filePath, content);

    // Provide the file for download
    res.download(filePath, 'exported_messages.txt', () => {
        // After download, remove the temporary file
        fs.unlinkSync(filePath);
    });
});

// Socket.io event handling
io.on('connection', (socket) => {
    // Extract client IP from the socket handshake
    const clientIp = socket.handshake.address.replace("::ffff:", "");

    // Log new user connection
    console.log('[👤] New User Connected', clientIp);

    // Event handler for receiving a username from a connected client
    socket.on('username', (username) => {
        // Store user information in the connectedUsers map
        connectedUsers.set(socket.id, { username, socket });

        // Get the current number of connected users
        const users = connectedUsers.size;

        // Emit an updated user list to all clients
        io.emit('updateUserList', {
            users: Array.from(connectedUsers.values()).map(user => user.username),
            numbusers: users
        });

        // Store the username in the socket object for reference
        socket.username = username;
    });

    // Event handler for receiving chat messages from clients
    socket.on('chatMessage', (msg) => {
        // Get the username associated with the socket
        const username = socket.username; 

        // Store the message in the messagesMap
        messagesMap.set(socket.id, { username, message: msg });

        // Get the current time for timestamping the message
        const time = new Date();
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const stringTime = `[${hours}:${formattedMinutes}:${seconds}]`;

        // Broadcast the chat message to all clients
        if (connectedUsers.get(socket.id)) {
            console.log("[💬] New Messages", clientIp);
            io.emit('chatMessage', `${stringTime} ${connectedUsers.get(socket.id).username}: ${msg}`);
        } else {
            console.log("[⚠️ ] No-name User Messages", clientIp);
        }
    });

    // Event handler for user disconnection
    socket.on('disconnect', () => {
        // Log user disconnection
        console.log('[❌] User Disconnected:', socket.id);

        // Remove the disconnected user from the connectedUsers map
        connectedUsers.delete(socket.id);

        // Get the current number of connected users
        const users = connectedUsers.size;

        // Emit an updated user list to all clients
        io.emit('updateUserList', {
            users: Array.from(connectedUsers.values()).map(user => user.username),
            numbusers: users
        });
    });

    socket.on('initiatePrivateChat', (usernameToChat) => {
          // TODO: Private  Chat  
    });
});

function generateUniqueId() {
    const idLength = parseInt(process.env.ID_LENGH);
    return crypto.randomBytes(idLength).toString('hex');
}

// Start the server on the specified port
server.listen(process.env.PORT, () => {
    console.log(`[⚡] http://localhost:${process.env.PORT}`);
});
