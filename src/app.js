const express = require('express');
const http = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const ejs = require('ejs');
const DOMPurify = require('dompurify'); // Sanitization library (to-do)
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config()

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', join(__dirname, './public'));
app.use('/public', express.static(join(__dirname, './public')));

// Maps to store connected users and messages
const connectedUsers = new Map();
const messagesMap = new Map();

let userCounter = 1;

const getTime = () => {
    const time = new Date();
    const formattedMinutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
    return `[${time.getHours()}:${formattedMinutes}:${time.getSeconds()}]`;
};

const generateAuthToken = (userId) => {
    return jwt.sign({ user: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const checkUserToken = (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication failed: jwt must be provided'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

        if (err) {
            return next(new Error('Authentication failed: invalid jwt'));
        }

        socket.user = decoded.user;

        next();
    });
};

const saveUserInformation = () => {
    const filePath = path.join(__dirname, 'user_information.json');

    const userInformationArray = Array.from(connectedUsers.values()).map(user => {
        const time = new Date();
        const formattedTime = `${time.getFullYear()}-${(time.getMonth() + 1).toString().padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')} ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
        return {
            name: user.username,
            socketId: user.socket.id,
            ip: user.socket.handshake.address.replace("::ffff:", ""),
            connection: formattedTime
        };
    });

    let existingData = [];

    try {
        const existingFile = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(existingFile);
    } catch (error) {
        console.error('Error reading existing file:', error.message);
    }

    const combinedData = existingData.concat(userInformationArray);

    fs.writeFileSync(filePath, JSON.stringify(combinedData, null, 2));
};

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/export', (req, res) => {
    const stringTime = getTime();

    const messagesArray = Array.from(messagesMap.values()).map(entry => `${stringTime} ${entry.username}: ${entry.message}`);

    const content = messagesArray.join('\n');

    const filePath = join(__dirname, 'exported_messages.txt');

    fs.writeFileSync(filePath, content);

    res.download(filePath, 'exported_messages.txt', () => {
        fs.unlinkSync(filePath);
    });
});

io.on('connection', (socket) => {
    
    const clientIp = socket.handshake.address.replace("::ffff:", "");

    console.log('[👤] New User Connected', clientIp);

    const initialToken = socket.handshake.auth.token;

    if (!initialToken) {
        const authToken = generateAuthToken(socket.id);
        socket.emit('authToken', authToken);
    }

    socket.on('username', (username) => {
    
        connectedUsers.set(socket.id, { username, socket });
    
        // if (initialToken) {
        //     saveUserInformation();
        // }
    
        const users = connectedUsers.size;
    
        io.emit('updateUserList', {
            users: Array.from(connectedUsers.values()).map(user => user.username),
            numbusers: users
        });
    
        socket.username = username;
    });
    // to change (todo)
    socket.on('chatMessage', (msg) => {
        const username = socket.username; 

        messagesMap.set(socket.id, { username, message: msg });

        const time = new Date();
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const stringTime = `[${hours}:${formattedMinutes}:${seconds}]`;

        if (connectedUsers.get(socket.id)) {
            console.log("[💬] New Messages", clientIp);
            io.emit('chatMessage', `${stringTime} ${connectedUsers.get(socket.id).username}: ${msg}`);
        } else {
            console.log("[⚠️ ] No-name User Messages", clientIp);
        }
    });

    socket.on('disconnect', () => {
        console.log('[❌] User Disconnected:', socket.id);

        connectedUsers.delete(socket.id);

        const users = connectedUsers.size;

        io.emit('updateUserList', {
            users: Array.from(connectedUsers.values()).map(user => user.username),
            numbusers: users
        });
    });
});

server.listen(process.env.PORT, () => {
    console.log(`[⚡] http://localhost:${process.env.PORT}`);
});
