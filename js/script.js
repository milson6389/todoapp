const inputTodo = document.getElementById("taskTodo");
const inputDueDate = document.getElementById("taskDueDate");
const inputPriority = document.getElementById("taskPriority");
const buttonSearch = document.getElementById("searchTask");
const buttonAdd = document.getElementById("addTask");
const todoForm = document.querySelector("#todoForm form");

const titleEmpty = document.querySelector("p.titleEmpty");
const priorityEmpty = document.querySelector("p.priorityEmpty");

let todos = [];

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

const addTodo = () => {
  if (inputTodo.value.trim() !== "" && inputPriority.value.trim() !== "") {
    titleEmpty.setAttribute("hidden", true);
    priorityEmpty.setAttribute("hidden", true);
    let newTodo = {
      id: +new Date(),
      task: inputTodo.value,
      startDt: new Date().toLocaleDateString(),
      dueDt: inputDueDate.value
        ? new Date(inputDueDate.value).toLocaleDateString()
        : new Date().toLocaleDateString(),
      priority: inputPriority.value,
      isTaken: false,
      isDone: false,
    };
    todos.push(newTodo);
    localStorage.setItem("todo", JSON.stringify(todos));
  } else {
    titleEmpty.removeAttribute("hidden");
    priorityEmpty.removeAttribute("hidden");
  }
};

buttonAdd.addEventListener("click", (e) => {
  e.preventDefault();
  addTodo();
});

window.addEventListener("DOMContentLoaded", () => {
  const localStorageData = localStorage.getItem("todo");
  if (localStorageData) {
    todos = [JSON.parse(localStorageData)];
  }

  inputDueDate.placeholder = new Intl.DateTimeFormat().format(new Date());
});
