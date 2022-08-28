"use strict";

const $main = document.querySelector("main");

// Template DOM elements
const $templ_section = document.querySelector("#template_section").content.firstElementChild;
const $templ_memory = document.querySelector("#template_memory").content.firstElementChild;

// sectionIds stores the ids of all the possible memory sections
const sectionIds = ["section_favorites", "section_timeline_year", "section_timeline_all"];

// sections stores all created memory section DOM elements
const sections = {};
import memories from '../data/memories.json' assert {type: 'json'};

// Copy the template_section and add it dynamically to the DOM
// Add as much sections as are defined in the sectionIds array

for (const sectionId of sectionIds) {
  const $section = $templ_section.cloneNode(true);

  $section.id = sectionId;
  sections[sectionId] = $section;
  $main.querySelector("section:first-of-type").after($section);
  console.log(sections);
}

// Loop through the memories, copy the template_memory and add it dynamically to the sections
// Depending on which section category the memory is related to, append it to the correct section

for (const {
  uuid,
  entryDate,
  favorite,
  mood,
  title,
  description,
  locations,
  activities,
  persons,
  images,
} of memories) {
  const $memory = $templ_memory.cloneNode(true);

  // Set the data from the database to the memory article in the DOM elements
  $memory.dataset.uuid = uuid;
  favorite && $memory.classList.add("favorite");
  $memory.querySelector("h6").textContent = "x days ago ...";
  $memory.querySelector("h4").textContent = entryDate;
  $memory.querySelector("h2").textContent = `${String.fromCodePoint(mood)} ${title}`;
  $memory.querySelector(".prev-description").textContent = description;

  // Loop through the locations array and render the locations to the DOM
  for (const location of locations) {
    const p = document.createElement("p");
    p.textContent = location;
    $memory.querySelector(".locations").append(p);
  }

  // Loop through the activities array and render the locations to the DOM
  for (const activity of activities) {
    const p = document.createElement("p");
    p.textContent = activity;
    $memory.querySelector(".activities").append(p);
  }

  // Loop through the persons array and render the locations to the DOM
  for (const person of persons) {
    const p = document.createElement("p");
    p.textContent = person;
    $memory.querySelector(".persons").append(p);
  }

  // Only for test purpose: Save every memory random in one of the three sections
  // const randomIndex = Math.floor(Math.random() * 3);
  // console.log(randomIndex)
  sections[sectionIds[2]].querySelector(".articles").append($memory);
}

// TODO: click on the arrows switch to the next memory
const $nextArticle = document.querySelector(".arrow-right");

$nextArticle.addEventListener("click", (e) => {
  // console.log(e.target.parentElement.querySelector(".articles").offsetLeft);
  e.target.parentElement.querySelector(".articles").scrollBy({
    left: 500,
    behavior: 'smooth'
  });
});
