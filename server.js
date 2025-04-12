const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');

// Import database models
const {UserModel, TodoModel} = require('./db.js');

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit with failure code if DB connection fails
});

/**
 * Authentication middleware
 * Validates JWT token and attaches user info to request
 */
async function auth(req, res, next) {
    const token = req.headers.token; 
   
    if (!token) {
        return res.status(401).json({
            message: "No authentication token provided",
            revertTo: "/public/login.html"
        });
    }
   
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findOne({ username: decoded.username });
        
        if(user) {
            req.user = decoded; // Save user info for later use
            next();
        } else {
            throw new Error("User not found");
        }
    } catch(err) {
        return res.status(401).json({
            message: "Please login first",
            revertTo: "/public/login.html"
        });
    }
}

// =============== ROUTES ===============

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Check authentication endpoint
app.get('/check-auth', auth, (req, res) => {
    res.status(200).json({
        message: "Authentication successful",
        revertTo: "/public/home.html"
    });
});

/**
 * User Signup
 * Creates a new user account
 */
app.post('/signup', async(req, res) => {
    const {username, password, email} = req.body;

    if(!username || !password || !email) {
        return res.status(400).json({
            message: "Missing required fields"
        });
    }
    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ username });
        
        if(existingUser) {
            return res.status(409).json({
                message: "Username already exists; please choose another name"
            });
        } 
        
        // Create new user in database
        const newUser = new UserModel({
            username,
            password, // Note: In production, this should be hashed
            email
        });
        
        await newUser.save();
        
        // Generate JWT token
        const token = jwt.sign({
            username: username
        }, process.env.JWT_SECRET);
        
        res.status(201).json({
            message: "You have successfully signed up",
            revertTo: "/public/home.html",
            token: token
        });
    } catch(err) {
        console.error('Signup error:', err);
        res.status(500).json({
            message: "Server-Side Error"
        });
    }
});

/**
 * User Login
 * Authenticates a user and provides a JWT token
 */
app.post('/login', async(req, res) => {
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({
            message: "Missing required fields"
        });
    }
    try {
        // Find user in database
        const user = await UserModel.findOne({ username, password });
        
        if(user) {
            // Generate JWT token
            const token = jwt.sign({
                username,
            }, process.env.JWT_SECRET);

            res.status(200).json({
                message: "You have logged in successfully",
                token: token,
                revertTo: "/public/home.html"
            });
        } else {
            return res.status(401).json({
                message: "Username/Password doesn't match",
                revertTo: "/public/login.html"
            });
        }
    } catch(err) {
        console.error('Login error:', err);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// =============== TODO CRUD OPERATIONS ===============

/**
 * Get all todos for the current user
 */
app.get('/todos', auth, async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const todos = await TodoModel.find({ userId: user._id }).sort({ createdAt: -1 });
        res.status(200).json(todos);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ message: "Error fetching todos" });
    }
});

/**
 * Create a new todo
 */
app.post('/todos', auth, async (req, res) => {
    const { todo } = req.body;
    
    if (!todo) {
        return res.status(400).json({ message: "Todo is required" });
    }
    
    try {
        const user = await UserModel.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const newTodo = new TodoModel({
            userId: user._id,
            todo,
            status: false
        });
        
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ message: "Error creating todo" });
    }
});

/**
 * Toggle todo completion status
 */
app.put('/todos/:id', auth, async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const todo = await TodoModel.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        
        // Compare ObjectIds properly
        if (todo.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        todo.status = !todo.status;
        await todo.save();
        
        res.status(200).json(todo);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ message: "Error updating todo" });
    }
});

/**
 * Delete a todo
 */
app.delete('/todos/:id', auth, async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const todo = await TodoModel.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        
        // Compare ObjectIds properly
        if (todo.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        await TodoModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Todo deleted" });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ message: "Error deleting todo" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n✅ Server running successfully!');
    console.log(`🔗 Access your app at: http://localhost:${PORT}`);
    console.log('📝 Todo App is ready to use!\n');
});