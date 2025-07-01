# Global Quiz Backend

The backend service for the Global Quiz game, built with Spring Boot.

## Features

- RESTful API for game management
- WebSocket support for real-time communication
- Redis for session management
- MySQL for data persistence
- Swagger API documentation

## Tech Stack

- Java 21
- Spring Boot 3.5.0
- Spring WebSocket
- Spring Data Redis
- Spring Data JPA
- MySQL
- Redis
- Maven

## Prerequisites

- Java 21 or higher
- Maven
- MySQL 8.0 or higher
- Redis 6.0 or higher

## Configuration

The application uses the following configuration files:
- `application.properties` - Main configuration
- `application-dev.properties` - Development environment configuration
- `application-prod.properties` - Production environment configuration

### Required Environment Variables

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/global_quiz
spring.datasource.username=your_username
spring.datasource.password=your_password

# Redis Configuration
spring.redis.host=your_redis_host
spring.redis.port=your_redis_port
spring.redis.password=your_redis_password
```

## Building the Project

```bash
./mvnw clean install
```

## Running the Application

```bash
./mvnw spring-boot:run
```

## API Documentation

Once the application is running, you can access the Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

## API Endpoints

### Room Management
- `POST /api/rooms` - Create a new game room
- `GET /api/rooms/{sessionId}` - Get room details
- `POST /api/rooms/{sessionId}/join` - Join a game room
- `PUT /api/rooms/{sessionId}/settings` - Update room settings
- `PUT /api/rooms/{sessionId}/players/{playerId}/ready` - Toggle player ready state

### Game Management
- `POST /api/game/{sessionId}/start` - Start the game
- `POST /api/game/{sessionId}/next` - Move to next question
- `POST /api/game/{sessionId}/answer` - Submit answer

## WebSocket Events

### Client to Server
- `join_room` - Join a game room
- `leave_room` - Leave a game room
- `submit_answer` - Submit an answer
- `player_ready` - Toggle ready state

### Server to Client
- `room_update` - Room state update
- `game_start` - Game started
- `new_question` - New question available
- `answer_result` - Answer result
- `game_end` - Game ended

## Testing

Run the tests using:
```bash
./mvnw test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 