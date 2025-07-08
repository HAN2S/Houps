# Global Quiz Backend

This is the backend service for the Global Quiz game, built with Spring Boot.  
It provides RESTful APIs and WebSocket endpoints for real-time multiplayer quiz gameplay.

## Features

- RESTful API for room, player, and game management
- Real-time updates via WebSocket
- Redis for session management
- MySQL for persistent storage
- Swagger/OpenAPI documentation

## Tech Stack

- Java 21
- Spring Boot 3.5.x
- Spring WebSocket
- Spring Data JPA & Redis
- MySQL
- Redis
- Maven

## Prerequisites

- Java 21+
- Maven
- MySQL 8+
- Redis 6+

## Configuration

Edit `src/main/resources/application.properties` with your database and Redis credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/global_quiz
spring.datasource.username=your_username
spring.datasource.password=your_password

# Redis Configuration
spring.redis.host=your_redis_host
spring.redis.port=your_redis_port
spring.redis.password=your_redis_password
```

## Running the Backend

```bash
cd Backend/global-quiz
mvn clean install
mvn spring-boot:run
```

The server will start on [http://localhost:8081](http://localhost:8081).

## API Documentation

Swagger UI: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)

## Running Tests

```bash
./mvnw test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## **Frontend: `Frontend/README.md`**

```markdown
# Global Quiz Frontend

This is the frontend for the Global Quiz game, built with React, TypeScript, and Vite.

## Features

- Real-time multiplayer quiz interface
- Room creation, lobby, and game screens
- WebSocket integration for live updates
- Responsive and modern UI

## Tech Stack

- React 18 + TypeScript
- Vite
- react-i18next (internationalization)
- CSS Modules / custom styles
- WebSocket

## Prerequisites

- Node.js 18+
- npm (comes with Node.js)

## Running the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (default Vite port).

## Project Structure

- `src/pages/` — Main screens (Lobby, Quiz, Score, etc.)
- `src/components/` — Reusable UI components
- `src/hooks/` — Custom React hooks
- `src/types/` — TypeScript types/interfaces
- `src/utils/` — Utility functions

## Environment Variables

If you need to change the backend API URL, create a `.env` file:

```
VITE_API_URL=http://localhost:8081
``` 