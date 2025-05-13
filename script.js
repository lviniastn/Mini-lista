const taskInput = document.querySelector(".task-input input");
const filters = document.querySelectorAll(".filters span");
const clearAll = document.querySelector(".clear-btn");
const taskBox = document.querySelector(".task-box");

let editId = null;
let isEditTask = false;
let todos = JSON.parse(localStorage.getItem("todo-list")) || [];

// 1. Gestão de filtros com objeto de mapeamento
const filterActions = {
  all: (todos) => todos,
  pending: (todos) => todos.filter(todo => todo.status === "pending"),
  completed: (todos) => todos.filter(todo => todo.status === "completed")
};

filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showTodo(btn.id);
  });
});

// 2. Operações com arrays de forma funcional
function showTodo(filter = "all") {
  const filteredTodos = filterActions[filter](todos);
  
  const taskHTML = filteredTodos.length > 0 
    ? filteredTodos.map((todo, id) => createTaskHTML(todo, id, filter)).join('')
    : `<span>Parece que você ainda não tem nenhuma tarefa aqui!</span>`;

  taskBox.innerHTML = taskHTML;
  updateUIState();
}

// 3. Criação de objetos para elementos da interface
function createTaskHTML(todo, id, filter) {
  const isVisible = filter === 'all' || filter === todo.status;
  if (!isVisible) return '';

  return `
    <li class="task">
      <label for="${id}">
        <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${todo.status === "completed" ? "checked" : ""}>
        <p class="${todo.status === "completed" ? "checked" : ""}">${todo.name}</p>
      </label>
      <div class="settings">
        <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
        <ul class="task-menu">
          <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i>Edit</li>
          <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
        </ul>
      </div>
    </li>
  `;
}

// 4. Operações imutáveis com arrays
function updateStatus(selectedTask) {
  const newTodos = todos.map((todo, index) => 
    index === Number(selectedTask.id)
      ? { ...todo, status: selectedTask.checked ? "completed" : "pending" }
      : todo
  );
  
  todos = newTodos;
  localStorage.setItem("todo-list", JSON.stringify(todos));
}

// 5. Destructuring para operações de edição
function editTask(taskId, textName) {
  editId = taskId;
  isEditTask = true;
  taskInput.value = textName;
  taskInput.focus();
  taskInput.classList.add("active");
}

// 6. Operação de deleção com filter
function deleteTask(deleteId, filter) {
  todos = todos.filter((_, index) => index !== deleteId);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo(filter);
}

// 7. Reset usando atribuição direta
clearAll.addEventListener("click", () => {
  todos = [];
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo();
});

// 8. Operações de entrada com desestruturação
taskInput.addEventListener("keyup", ({ key }) => {
  const userTask = taskInput.value.trim();
  
  if (key === "Enter" && userTask) {
    todos = isEditTask
      ? todos.map((todo, index) => 
          index === editId ? { ...todo, name: userTask } : todo
        )
      : [...todos, { name: userTask, status: "pending" }];

    taskInput.value = "";
    isEditTask = false;
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(document.querySelector("span.active").id);
  }
});

// Funções auxiliares
function updateUIState() {
  clearAll.classList.toggle("active", todos.length > 0);
  taskBox.classList.toggle("overflow", taskBox.offsetHeight >= 300);
}

function showMenu(selectedTask) {
  const menuDiv = selectedTask.parentElement.lastElementChild;
  menuDiv.classList.add("show");
  
  document.addEventListener("click", (e) => {
    if (e.target.tagName !== "I" || e.target !== selectedTask) {
      menuDiv.classList.remove("show");
    }
  }, { once: true });
}

// Inicialização
showTodo("all");