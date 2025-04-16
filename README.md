# TaskSync Pro

A sophisticated task management platform with secure user authentication, real-time updates, and a clean, modern UI.

## Features

- **Secure Authentication**: Complete user account system with JWT
- **Task Management**: Create, organize, and track tasks efficiently
- **Status Tracking**: Mark tasks as complete/incomplete with visual indicators
- **Real-time Updates**: Immediate UI refreshes when tasks are modified
- **Clean User Interface**: Intuitive design with responsive elements
- **Task Analytics**: Track completion rates with the task counter

## Tech Stack

- **Frontend**: Modern HTML5, CSS3, and JavaScript ES6+
- **Backend**: Node.js with Express.js RESTful API architecture
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Authentication**: JWT (JSON Web Tokens) with secure storage
- **HTTP Client**: Axios for promise-based HTTP requests

## Project Structure

```
.
├── public/                  # Client-side assets
│   ├── home.html            # Task management dashboard
│   ├── login.html           # Authentication portal
│   ├── signup.html          # New user registration
│   ├── script.js            # Client-side application logic
│   └── style.css            # UI styling
├── .env                     # Environment configuration
├── .gitignore               # Git exclusion rules
├── db.js                    # Database models & schema
├── index.html               # Entry point with auth verification
├── package.json             # Project metadata & dependencies
├── README.md                # Project documentation
└── server.js                # Express server & API endpoints
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd TaskSync-pro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. For development with auto-restart:
   ```
   npm run dev
   ```

5. Access the application:
   ```
   http://localhost:3000
   ```

## API Architecture

### Authentication Endpoints

- `POST /signup` - Register new user account with validation
- `POST /login` - Authenticate user and generate JWT
- `GET /check-auth` - Validate authentication status

### Task Management Endpoints

- `GET /todos` - Retrieve all tasks for the authenticated user
- `POST /todos` - Create a new task with validation
- `PUT /todos/:id` - Toggle task completion status
- `DELETE /todos/:id` - Remove a task with authorization verification

## Security Implementation

- JWT-based authentication
- Server-side validation for all inputs
- Protected routes requiring authentication
- Proper error handling and status codes
- Authorization checks for all task operations

## Future Enhancements

- Password hashing for enhanced security
- Task categorization and filtering
- Due dates and priority levels
- Advanced analytics dashboard
- User profile management
- Email notifications

## License

This project is licensed under the ISC License. 