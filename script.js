// Theme Management
const THEMES = ['dark', 'medium-dark', 'medium', 'lofi', 'light'];
const DEFAULT_THEME = 'lofi';

function initTheme() {
    const savedTheme = localStorage.getItem('kanbanTheme') || DEFAULT_THEME;
    setTheme(savedTheme);
}

function setTheme(themeName) {
    if (!THEMES.includes(themeName)) {
        themeName = DEFAULT_THEME;
    }
    
    // Remove all theme classes
    THEMES.forEach(theme => {
        document.documentElement.classList.remove(`theme-${theme}`);
    });
    
    // Add the selected theme class
    document.documentElement.classList.add(`theme-${themeName}`);
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        }
    });
    
    // Save to localStorage
    localStorage.setItem('kanbanTheme', themeName);
}

// Initialize theme on page load
initTheme();

// Add theme button listeners
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        setTheme(e.target.getAttribute('data-theme'));
    });
});

const todo = document.querySelector('#todo');
const progress = document.querySelector('#progress');
const done = document.querySelector('#done');

let draggedElement = null;

// Function to update task counts
function updateTaskCounts() {
    const todoCount = todo.querySelectorAll('.task').length;
    const progressCount = progress.querySelectorAll('.task').length;
    const doneCount = done.querySelectorAll('.task').length;
    
    document.querySelector('#todo .heading .right').textContent = todoCount;
    document.querySelector('#progress .heading .right').textContent = progressCount;
    document.querySelector('#done .heading .right').textContent = doneCount;
}

// Function to save tasks to local storage
function saveTasks() {
    const kanbanData = {
        todo: [],
        progress: [],
        done: []
    };
    
    todo.querySelectorAll('.task').forEach(task => {
        kanbanData.todo.push({
            title: task.querySelector('h2').textContent,
            description: task.querySelector('p').textContent
        });
    });
    
    progress.querySelectorAll('.task').forEach(task => {
        kanbanData.progress.push({
            title: task.querySelector('h2').textContent,
            description: task.querySelector('p').textContent
        });
    });
    
    done.querySelectorAll('.task').forEach(task => {
        kanbanData.done.push({
            title: task.querySelector('h2').textContent,
            description: task.querySelector('p').textContent
        });
    });
    
    localStorage.setItem('kanbanBoard', JSON.stringify(kanbanData));
}

// Function to load tasks from local storage
function loadTasks() {
    const savedData = localStorage.getItem('kanbanBoard');
    if (savedData) {
        const kanbanData = JSON.parse(savedData);
        
        // Clear existing tasks
        todo.querySelectorAll('.task').forEach(task => task.remove());
        progress.querySelectorAll('.task').forEach(task => task.remove());
        done.querySelectorAll('.task').forEach(task => task.remove());
        
        // Load todo tasks
        kanbanData.todo.forEach(taskData => {
            createTask(taskData.title, taskData.description, todo);
        });
        
        // Load progress tasks
        kanbanData.progress.forEach(taskData => {
            createTask(taskData.title, taskData.description, progress);
        });
        
        // Load done tasks
        kanbanData.done.forEach(taskData => {
            createTask(taskData.title, taskData.description, done);
        });
        
        updateTaskCounts();
    }
}

// Function to create and add a task to a column
function createTask(title, description, column) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable","true");
    div.innerHTML = `<h2>${title}</h2><p>${description}</p><button class="delete-btn">Delete</button>`;
    
    // Add drag functionality
    div.addEventListener("dragstart",(e)=>{
        draggedElement = e.target.closest(".task");
        console.log("dragging",e);
    });

    // Add delete functionality
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener("click",()=>{
        div.remove();
        updateTaskCounts();
        saveTasks();
    });

    column.appendChild(div);
}

// Load tasks on page load
loadTasks();

const tasks = document.querySelectorAll('.task');
tasks.forEach(task => {
    task.addEventListener("dragstart",(e)=>{
        draggedElement = e.target;
        console.log("dragging",e);
    })
});

// Helper function to add hover listeners to columns
function addHoverListeners(column) {
    let dragCounter = 0;
    
    column.addEventListener("dragenter",(e)=>{
        e.preventDefault();
        dragCounter++;
        column.classList.add("hover-over");
    });
    
    column.addEventListener("dragleave",(e)=>{
        dragCounter--;
        if(dragCounter === 0) {
            column.classList.remove("hover-over");
        }
    });
    
    column.addEventListener("dragover",(e)=>{
        e.preventDefault();
    });
    
    column.addEventListener("drop",(e)=>{
        e.preventDefault();
        dragCounter = 0;
        if(draggedElement) {
            column.appendChild(draggedElement);
            draggedElement = null;
            updateTaskCounts();
            saveTasks();
        }
        column.classList.remove("hover-over");
    });
}

addHoverListeners(todo);
addHoverListeners(progress);
addHoverListeners(done);

// modal related logic 
const toggleModalButton = document.querySelector('#toggle-modal');
const modal = document.querySelector('.modal');
const modalBg = document.querySelector('.modal .bg');
const addTaskButton = document.querySelector('#add-new-task');
const taskTitleInput = document.querySelector('#task-title-input');
const taskDescInput = document.querySelector('textarea');

toggleModalButton.addEventListener("click",()=>{
    modal.classList.toggle("active");
});

modalBg.addEventListener("click",()=>{
    modal.classList.remove("active");
});

addTaskButton.addEventListener("click",()=>{
    const taskTitle = taskTitleInput.value;
    const taskDesc = taskDescInput.value;

   if(taskTitle.trim() === "" || taskDesc.trim() === "") {
       alert("Please fill in both fields");
       return;
   }

   createTask(taskTitle, taskDesc, todo);
   updateTaskCounts();
   saveTasks();

   // Clear input fields
   taskTitleInput.value = "";
   taskDescInput.value = "";
   
   modal.classList.remove("active");
});

