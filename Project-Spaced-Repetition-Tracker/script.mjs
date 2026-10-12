import { getData, addData } from "./storage.mjs";

import {
  getLocalDateString,
  getUpcomingRevisions,
  parseStudyDate,
} from "./utils.mjs";

const userSelect = document.querySelector("#user-select");
const agendaMessage = document.querySelector("#agenda-message");
const agendaList = document.querySelector("#agenda-list");
const topicForm = document.querySelector("#topic-form");
const topicName = document.querySelector("#topic-name");
const studyDate = document.querySelector("#study-date");

setDefaultStudyDate();

userSelect.addEventListener("change", () => {
  renderAgenda(userSelect.value);
});

topicName.addEventListener("input", () => {
  topicName.setCustomValidity("");
});

topicForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = topicName.value.trim();
  const date = studyDate.value;
  const userId = userSelect.value;

  if (!userId) {
    agendaMessage.textContent = "Please select a user.";
    userSelect.focus();
    return;
  }

  if (!name) {
    agendaMessage.textContent = "Please enter a topic name.";
    topicName.setCustomValidity("Please enter a topic name.");
    topicName.reportValidity();
    return;
  }

  if (!parseStudyDate(date)) {
    agendaMessage.textContent = "Please select a valid date.";
    studyDate.focus();
    return;
  }

  const topic = {
    name: name,
    date: date,
  };

  addData(userId, [topic]);

  renderAgenda(userId);

  topicForm.reset();
  setDefaultStudyDate();
});

function setDefaultStudyDate() {
  studyDate.value = getLocalDateString();
}

function renderAgenda(userId) {
  agendaList.replaceChildren();

  if (!userId) {
    agendaMessage.textContent = "Please select a user.";
    return;
  }

  const topics = getData(userId) || [];
  const revisions = getUpcomingRevisions(topics);

  if (revisions.length === 0) {
    agendaMessage.textContent = "No upcoming revisions for this user.";
    return;
  }

  agendaMessage.textContent =
    `You have ${revisions.length} upcoming revisions.`;

  for (const revision of revisions) {
    const listItem = document.createElement("li");

    const formattedDate = revision.date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    listItem.textContent =
      `${revision.name} — revise on ${formattedDate}`;

    agendaList.appendChild(listItem);
  }
}