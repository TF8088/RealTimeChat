# RealTimeChat

## Introduction

RealTimeChat is a simple real-time chat application built with Node.js, Express, Socket.IO, and JSON Web Tokens (JWT). It allows users to join the chat, send messages, and view a list of connected users.

## Setup

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js
- npm (Node Package Manager)

### Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/TF8088/RealTimeChat.git
    ```

2. Navigate to the project directory:

    ```bash
    cd RealTimeChat
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file in the root of the project and add the following:

    ```env
    JWT_SECRET=your_secret_key
    PORT=8080
    ```

    Replace `your_secret_key` with a secure secret key for JWT.

5. Start the server:

    ```bash
    npm start
    ```

6. Open your browser and go to [http://localhost:8080](http://localhost:8080) to use the RealTimeChat application.

## Usage

- Open the application in your browser.
- Enter your username and start chatting in real-time with other users.
- Use the chat input to send messages.

## Contributing

Feel free to contribute to this project by opening issues or submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
