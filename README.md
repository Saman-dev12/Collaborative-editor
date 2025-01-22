# Collaborative Code Editor

## Overview
The Collaborative Code Editor is a web-based platform designed for real-time coding collaboration. It supports multiple programming languages, displays live code output, and allows multiple users to work together simultaneously on the same project.

## Features
- **Real-Time Collaboration:** Multiple users can code together in a shared environment with low latency.
- **Multi-Language Support:** Includes support for various programming languages such as Python, JavaScript, Java, and more.
- **Live Code Execution:** Displays the output of the code in real-time for supported languages.
- **User-Friendly Interface:** Clean and intuitive UI for seamless coding collaboration.
- **Secure Sessions:** Ensures data integrity and privacy during collaborative sessions.

## Technologies Used
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **WebSocket Communication:** Socket.IO for real-time collaboration
- **Code Execution Engine:** Docker-based containerization for safe and isolated code execution
- **Database:** MongoDB

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Saman-dev12/Collaborative-Editor.git
   cd Collaborative-Code-Editor
   ```
2. Install dependencies for both the client and server:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the `server` directory.
   - Add the following variables:
     ```env
     PORT=5000
     ```
4. Start the development server:
   ```bash
   cd backend
   npm run dev
   ```
5. Start the client:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage
1. Open the application in your browser.
2. Create or join a coding session by sharing a unique session link.
3. Begin collaborative coding with your team.
4. View live output for supported programming languages.

## Future Improvements
- Integration with popular version control systems (e.g., GitHub).
- Syntax highlighting and autocomplete for enhanced productivity.
- Support for more programming languages.
- Enhanced performance for handling larger collaborative teams.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push to the branch:
   ```bash
   git push origin feature-name
   ```
4. Open a pull request describing your changes.

## License
This project is licensed under the [MIT License](LICENSE).

---

For any questions or support, please open an issue in the repository or contact me directly.
