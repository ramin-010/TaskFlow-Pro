// DOM Elements
const loginUsername = document.getElementById("LoginUsername");
const loginPassword = document.getElementById("LoginPassword");
const loginBtn = document.getElementById("LoginBtn");
const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");
const signupEmail = document.getElementById("signupEmail");
const signupBtn = document.getElementById("signupBtn");
const message = document.getElementById("message");

// Home page elements
const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");
const logoutBtn = document.getElementById("logoutBtn");
const taskCounter = document.getElementById("taskCounter");

// Event listeners for auth pages
if (signupBtn) {
    signupBtn.addEventListener("click", signup);
}
if (loginBtn) {
    loginBtn.addEventListener("click", login);
}

// Event listeners for home page
if (addTodoBtn) {
    addTodoBtn.addEventListener("click", addTodo);
    // Load todos when page loads
    loadTodos();
}
if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}

// Handle enter key for form submission
document.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (document.activeElement === signupUsername ||
            document.activeElement === signupPassword ||
            document.activeElement === signupEmail) {
            signup();
        } else if (document.activeElement === loginUsername ||
                   document.activeElement === loginPassword) {
            login();
        } else if (document.activeElement === todoInput) {
            addTodo();
        }
    }
});

// Signup function
async function signup() {
    const username = signupUsername.value.trim();
    const password = signupPassword.value.trim();
    const email = signupEmail.value.trim();

    if (!username || !password || !email) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const res = await axios.post("http://localhost:3000/signup", {
            username: username,
            password: password,
            email: email
        });
        
        if (res.data.token) {
            localStorage.setItem("token", res.data.token);
        }
        if (res.data.revertTo) {
            window.location.href = res.data.revertTo;
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            message.innerHTML = err.response.data.message;
        } else {
            message.innerHTML = "Server side error: Error signing up";
        }
    }
}

// Login function
async function login() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
        alert("Please fill in required fields");
        return;
    }

    try {
        const res = await axios.post("http://localhost:3000/login", {
            username: username,
            password: password
        });
        
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        if (res.data.revertTo) {
            window.location.href = res.data.revertTo;
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            message.innerHTML = err.response.data.message;
            loginUsername.value = "";
            loginPassword.value = "";
        } else {
            message.innerHTML = "Server error";
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/public/login.html';
}

// Load todos from server
async function loadTodos() {
    try {
        const res = await axios.get('http://localhost:3000/todos', {
            headers: {
                token: localStorage.getItem('token')
            }
        });
        
        displayTodos(res.data);
        
        // Update counter
        if (taskCounter) {
            const activeTasks = res.data.filter(todo => !todo.status).length;
            taskCounter.textContent = activeTasks;
        }
    } catch (err) {
        console.error('Error loading todos:', err);
        if (err.response && err.response.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/public/login.html';
        }
    }
}

// Display todos in the UI
function displayTodos(todos) {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-list">
                <p>Your todo list is empty!</p>
                <p class="small">Add your first task above</p>
            </div>
        `;
        return;
    }
    
    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.status ? 'completed' : ''}`;
        
        todoItem.innerHTML = `
            <input type="checkbox" class="form-check-input" ${todo.status ? 'checked' : ''} data-id="${todo._id}">
            <span class="todo-text">${todo.todo}</span>
            <button class="btn delete-btn" data-id="${todo._id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
        // Add event listeners to the buttons
        const checkbox = todoItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', toggleTodoStatus);
        
        const deleteBtn = todoItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', deleteTodo);
        
        todoList.appendChild(todoItem);
    });
}

// Add new todo
async function addTodo() {
    const todoText = todoInput.value.trim();
    
    if (!todoText) {
        alert('Please enter a todo');
        return;
    }
    
    try {
        await axios.post('http://localhost:3000/todos', 
            { todo: todoText },
            { 
                headers: { 
                    token: localStorage.getItem('token') 
                } 
            }
        );
        
        // Clear input field
        todoInput.value = '';
        
        // Reload todos
        loadTodos();
    } catch (err) {
        console.error('Error adding todo:', err);
        alert('Error adding todo. Please try again.');
    }
}

// Toggle todo completion status
async function toggleTodoStatus(e) {
    const todoId = e.target.getAttribute('data-id');
    
    try {
        await axios.put(`http://localhost:3000/todos/${todoId}`, {}, {
            headers: {
                token: localStorage.getItem('token')
            }
        });
        
        // Reload todos to reflect changes
        loadTodos();
    } catch (err) {
        console.error('Error updating todo:', err);
        alert('Error updating todo');
    }
}

// Delete a todo
async function deleteTodo(e) {
    const todoId = e.target.closest('.delete-btn').getAttribute('data-id');
    
    try {
        await axios.delete(`http://localhost:3000/todos/${todoId}`, {
            headers: {
                token: localStorage.getItem('token')
            }
        });
        
        // Reload todos to reflect changes
        loadTodos();
    } catch (err) {
        console.error('Error deleting todo:', err);
        alert('Error deleting todo');
    }
} 