// Bagian Form Input
const inputTodo = document.getElementById("taskTodo");
const inputDueDate = document.getElementById("taskDueDate");
const inputPriority = document.getElementById("taskPriority");
const buttonSearch = document.getElementById("searchTask");
const buttonAdd = document.getElementById("addTask");
const todoForm = document.querySelector("#todoForm form");
const buttonDeleteAll = document.getElementById("clearTodo");

const titleEmpty = document.querySelector("p.titleEmpty");
const priorityEmpty = document.querySelector("p.priorityEmpty");

// Bagian Table
const sectionTodoList = document.getElementById("todoList");
const newTaskTable = document.getElementById("new");
const newTaskTableBody = document.getElementById("newTaskRow");
const inpTaskTable = document.getElementById("inprogress");
const inpTaskTableBody = document.getElementById("inpTaskRow");
const doneTaskTable = document.getElementById("complete");
const doneTaskTableBody = document.getElementById("doneTaskRow");
const lateTaskTable = document.getElementById("overdue");
const lateTaskTableBody = document.getElementById("lateTaskRow");

// Function to sort array of object by object's property
const sortAscBy = (arr, prop, isDateType = false) => {
  if (isDateType) {
    return arr.sort((a, b) => new Date(a[prop]) - new Date(b[prop]));
  }
  return arr.sort((a, b) => a[prop] - b[prop]);
};
const sortDscBy = (arr, prop, isDateType = false) => {
  if (isDateType) {
    return arr.sort((a, b) => new Date(b[prop]) - new Date(a[prop]));
  }
  return arr.sort((a, b) => b[prop] - a[prop]);
};

// Function to format date with custom format "Day, date month year"
const dateFormatter = (date) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  date = new Date(date);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const result = `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;

  return result;
};

const Status = Object.freeze({
  NEW: "new",
  INP: "inprogress",
  DONE: "done",
  LATE: "late",
});

let todos = [];
if (todos.length == 0 && localStorage.getItem("todo")) {
  todos = [...JSON.parse(localStorage.getItem("todo"))];
}
let currentTodos = [];
let new_todos = [];
let inp_todos = [];
let done_todos = [];
let late_todos = [];

// repopulate array after changes (add, edit, delete) & search queries
const refreshArrayContentSource = (
  source,
  query = {
    task: "",
    startDt: new Date().toLocaleDateString(),
    priority: [1, 2, 3],
  }
) => {
  currentTodos = source.filter(
    (todo) =>
      todo.task.toLowerCase().includes(query.task.toLowerCase()) &&
      query.priority.includes(todo.priority) &&
      todo.startDt == query.startDt
  );
  currentTodos = sortAscBy(currentTodos, "priority");
  new_todos = currentTodos.filter((todo) => todo.status === Status.NEW);
  inp_todos = currentTodos.filter(
    (todo) => todo.status === Status.INP || todo.status === Status.DONE
  ); //tujuannya agar task tetap ada di list inprogress tapi tampilannya tercoret
  inp_todos = sortDscBy(inp_todos, "status");
  done_todos = currentTodos.filter((todo) => todo.status === Status.DONE);
  late_todos = source.filter(
    (todo) =>
      todo.status !== Status.DONE &&
      todo.task.toLowerCase().includes(query.task.toLowerCase()) &&
      query.priority.includes(todo.priority) &&
      todo.dueDt < new Date().toLocaleDateString() &&
      todo.startDt < new Date().toLocaleDateString()
  );
};

// repopulate table layout -> show table if array length > 0
const refreshTableLayout = () => {
  newTaskTable.setAttribute("hidden", true);
  inpTaskTable.setAttribute("hidden", true);
  doneTaskTable.setAttribute("hidden", true);
  lateTaskTable.setAttribute("hidden", true);

  if (new_todos.length > 0) {
    newTaskTable.removeAttribute("hidden");
  }
  if (inp_todos.length > 0) {
    inpTaskTable.removeAttribute("hidden");
  }
  if (done_todos.length > 0) {
    doneTaskTable.removeAttribute("hidden");
  }
  if (late_todos.length > 0) {
    lateTaskTable.removeAttribute("hidden");
  }
};

todos = sortDscBy(todos, "startDt", true);
todos = sortAscBy(todos, "priority");

const formInputReset = () => {
  inputTodo.value = "";
  (inputDueDate.value = new Date().toLocaleDateString()),
    (inputPriority.value = "");
};

const addTodo = () => {
  if (inputTodo.value.trim() !== "" && inputPriority.value.trim() !== "") {
    titleEmpty.setAttribute("hidden", true);
    priorityEmpty.setAttribute("hidden", true);
    let newTodo = {
      id: +new Date(),
      task: inputTodo.value,
      startDt: inputDueDate.value
        ? new Date(inputDueDate.value).toLocaleDateString()
        : new Date().toLocaleDateString(),
      dueDt: inputDueDate.value
        ? new Date(inputDueDate.value).toLocaleDateString()
        : new Date().toLocaleDateString(),
      priority: parseInt(inputPriority.value),
      status:
        new Date(inputDueDate.value).toLocaleDateString() <
        new Date().toLocaleDateString()
          ? Status.LATE
          : Status.NEW,
    };
    todos.push(newTodo);
    localStorage.setItem("todo", JSON.stringify(todos));
    formInputReset();
  } else {
    if (inputTodo.value.trim() == "") {
      titleEmpty.removeAttribute("hidden");
    }
    if (inputPriority.value.trim() == "") {
      priorityEmpty.removeAttribute("hidden");
    }
  }
  loadTableData();
};

const searchTodo = () => {
  let searchByTitle = "";
  let searchByDate = new Date().toLocaleDateString();
  let priorities = [1, 2, 3];

  if (inputTodo.value.trim() !== "") {
    searchByTitle = inputTodo.value;
  }
  if (inputDueDate.value) {
    searchByDate = new Date(inputDueDate.value).toLocaleDateString();
  }
  if (inputPriority.value.trim() !== "") {
    priorities = [parseInt(inputPriority.value)];
  }
  let searchQueries = {
    task: searchByTitle,
    startDt: searchByDate,
    priority: priorities,
  };
  inputPriority.value = ""; //bisa menampilkan semua priority level kembali
  loadTableData(searchQueries);
};

const generateTableRowData = (data) => {
  let checkedStyleClass = data.status === Status.DONE ? "taskChecked" : "";
  let taskPriorityStyleClass = "";
  let taskPriorityText = "";
  switch (data.priority) {
    case 1:
      taskPriorityText = "High";
      taskPriorityStyleClass = "priorityHigh";
      break;
    case 2:
      taskPriorityText = "Medium";
      taskPriorityStyleClass = "priorityMed";
      break;
    default:
      taskPriorityText = "Low";
      taskPriorityStyleClass = "priorityLow";
      break;
  }

  let template = `
    <tr class="${checkedStyleClass}" id="${data.id}">
      <td>
        <input type="checkbox" ${
          data.status === Status.DONE ? "checked" : ""
        } name="takeTask" id="takeTask_${data.id}" onclick="updateTodoById(${
    data.id
  })"  />
      </td>
      <td>${data.task}</td>
      <td class="${taskPriorityStyleClass}">${taskPriorityText}</td>
      <td>${dateFormatter(data.startDt)}</td>
      <td>${dateFormatter(data.dueDt)}</td>
      <td>
        <button class="deleteTodo" onclick="deleteTodoById(${data.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
  return template;
};

const generateTableDoneData = (data) => {
  let taskPriorityStyleClass = "";
  let taskPriorityText = "";
  switch (data.priority) {
    case 1:
      taskPriorityText = "High";
      taskPriorityStyleClass = "priorityHigh";
      break;
    case 2:
      taskPriorityText = "Medium";
      taskPriorityStyleClass = "priorityMed";
      break;
    default:
      taskPriorityText = "Low";
      taskPriorityStyleClass = "priorityLow";
      break;
  }

  let template = `
    <tr>
      <td colspan="2">${data.task}</td>
      <td class="${taskPriorityStyleClass}">${taskPriorityText}</td>
      <td>${dateFormatter(data.startDt)}</td>
      <td>${dateFormatter(data.dueDt)}</td>
      <td>
        <button class="deleteTodo" onclick="deleteTodoById(${data.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
  return template;
};

const loadTableData = (
  query = {
    task: "",
    startDt: new Date().toLocaleDateString(),
    priority: [1, 2, 3],
  }
) => {
  refreshArrayContentSource(todos, query);
  sectionTodoList.style.display = "flex";
  if (todos.length === 0) {
    sectionTodoList.style.display = "none";
  }

  let allNewTaskList = "";
  for (let i = 0; i < new_todos.length; i++) {
    allNewTaskList += generateTableRowData(new_todos[i]);
  }
  newTaskTableBody.innerHTML = allNewTaskList;
  let allInpTaskList = "";
  for (let i = 0; i < inp_todos.length; i++) {
    allInpTaskList += generateTableRowData(inp_todos[i]);
  }
  inpTaskTableBody.innerHTML = allInpTaskList;
  let allDoneTaskList = "";
  for (let i = 0; i < done_todos.length; i++) {
    allDoneTaskList += generateTableDoneData(done_todos[i]);
  }
  doneTaskTableBody.innerHTML = allDoneTaskList;
  let allLateTaskList = "";
  for (let i = 0; i < late_todos.length; i++) {
    allLateTaskList += generateTableRowData(late_todos[i]);
  }
  lateTaskTableBody.innerHTML = allLateTaskList;
  refreshTableLayout();
};

const updateTodoById = (id) => {
  let selectedTodo = todos.find((todo) => todo.id == id);
  todos = todos.filter((todo) => todo.id !== id);
  if (selectedTodo.status == Status.NEW) {
    selectedTodo = { ...selectedTodo, status: Status.INP };
  } else if (selectedTodo.status == Status.LATE) {
    selectedTodo = {
      ...selectedTodo,
      status: Status.INP,
      startDt: new Date().toLocaleDateString(),
    };
  } else if (selectedTodo.status == Status.INP) {
    selectedTodo = { ...selectedTodo, status: Status.DONE };
  } else if (selectedTodo.status == Status.DONE) {
    selectedTodo = { ...selectedTodo, status: Status.INP };
  }
  todos.push(selectedTodo);
  localStorage.setItem("todo", JSON.stringify(todos));
  loadTableData();
};

const deleteTodoById = (id) => {
  if (confirm("Delete Todo ?")) {
    todos = todos.filter((todo) => todo.id !== id);
    localStorage.setItem("todo", JSON.stringify(todos));
    formInputReset();
    loadTableData();
  }
};

const deleteAllTodo = () => {
  if (confirm("Delete All Todo ?")) {
    todos = [];
    localStorage.removeItem("todo");
    formInputReset();
    loadTableData();
  }
};

buttonAdd.addEventListener("click", (e) => {
  e.preventDefault();
  addTodo();
});

buttonSearch.addEventListener("click", (e) => {
  e.preventDefault();
  searchTodo();
});

buttonDeleteAll.addEventListener("click", (e) => {
  e.preventDefault();
  deleteAllTodo();
});

window.addEventListener("DOMContentLoaded", () => {
  inputDueDate.placeholder = new Intl.DateTimeFormat().format(new Date());
  loadTableData();
  console.log("Todos: ", todos);
});
