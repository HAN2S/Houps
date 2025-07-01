# Global Quiz Game

A multiplayer quiz game where players can create rooms, join games, and compete in real-time.

## Project Structure

```
game/
├── Frontend/          # React frontend application
│   └── global-quiz/   # React project
└── Backend/           # Spring Boot backend application
    └── global-quiz/   # Spring Boot project
```

## Features

- Real-time multiplayer gameplay
- Room creation and management
- Player ready system
- Multiple categories support
- Score tracking
- Real-time updates using WebSocket

## Tech Stack

### Frontend
- React
- TypeScript
- Socket.IO Client
- Material-UI

### Backend
- Spring Boot
- WebSocket
- Redis
- MySQL
- JPA/Hibernate

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Java 21
- MySQL
- Redis

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend/global-quiz
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend/global-quiz
   ```
2. Build the project:
   ```bash
   ./mvnw clean install
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

## API Documentation

The API documentation is available at `http://localhost:8080/swagger-ui.html` when the backend is running.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 