const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

/**
 * User Schema
 * Defines the structure for user data
 */
const Users = new Schema({
    username: String,
    password: String,
    email: String
});

/**
 * Todo Schema
 * Defines the structure for todo items
 */
const Todos = new Schema({
    userId: ObjectId,
    todo: String,
    status: Boolean
});

// Create models from schemas
const UserModel = mongoose.model('users', Users);
const TodoModel = mongoose.model('todos', Todos);

// Export models
module.exports = {
    UserModel: UserModel,
    TodoModel: TodoModel
}