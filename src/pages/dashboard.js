"use strict";

const $main = document.querySelector("main");

// Template DOM elements
const $templ_section = document.querySelector("#template_section").content.firstElementChild;
const $templ_memory = document.querySelector("#template_memory").content.firstElementChild;

// sectionIds stores the ids of all the possible memory sections
const sectionIds = ["section_favorites", "section_timeline_year", "section_timeline_all"];

// sections stores all created memory section DOM elements
const sections = {};

const memories = [
  {
    uuid: "67d5dc07-566e-44e0-a13b-2fa7f87d7b22",
    entryDate: "20.08.2022",
    favorite: false,
    mood: "128517",
    title: "Nice day",
    description: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
    nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
    erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
    et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
    sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
    et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
    accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
    no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
    locations: ["Zirl", "Kematen"],
    activities: ["Radfahren", "Wandern"],
    persons: ["Chrissi", "Jakob"],
    images: ["url", "url", "url"],
  },
  {
    uuid: "4fac566b-e5a6-469e-ade2-ad9214d121ef",
    entryDate: "21.08.2022",
    favorite: true,
    mood: "128519",
    title: "Nice day",
    description: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
    nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
    erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
    et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
    sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
    et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
    accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
    no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
    locations: ["Zirl", "Obertilliach"],
    activities: ["Radfahren", "Wandern"],
    persons: ["Elisabeth", "Chrissi", "Jakob"],
    images: ["url", "url", "url"],
  },
  {
    uuid: "1fa8a66b-e5a6-469e-23e2-ad9e43d121ef",
    entryDate: "22.08.2022",
    favorite: false,
    mood: "128520",
    title: "Nice day",
    description: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
    nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
    erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
    et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
    sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
    et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
    accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
    no sea takimata sanctus est Lorem ipsum dolor sit amet.`,
    locations: ["Zirl", "Innsbruck", "Telfs"],
    activities: ["Chillen", "Netflixen"],
    persons: ["Chrissi"],
    images: ["url", "url", "url"],
  },
];

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
  favorite && $memory.setAttribute("class", "favorite");
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

  sections[sectionIds[2]].querySelector(".articles").append($memory);
}
