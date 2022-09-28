"use strict";

const $main = document.querySelector("main");

// Template DOM elements
const $templ_section = document.querySelector("#template_section").content.firstElementChild;
const $templ_memory = document.querySelector("#template_memory").content.firstElementChild;

const $dialog = document.querySelector("dialog");
const $dialogBackdrop = document.querySelector("#div_dialogBackdrop");

const $memoryTitle = document.querySelector("#inp_title");
const $memoryDate = document.querySelector("#inp_entryDate");
const $favorite = document.querySelector("#img_favorite");
const $emojis = document.querySelector("#div_emojis");
const $description = document.querySelector("#ta_description");
const $locations = document.querySelector("#span_locations");
const $activities = document.querySelector("#span_activities");
const $persons = document.querySelector("#span_persons");

const $saveMemory = document.querySelector("#btn_saveMemory");

// sectionIds stores the ids of all the possible memory sections
const sectionIds = ["section_favorites", "section_timelineAll", "section_timelineRecentlyAdded"];

// sections stores all created sections DOM elements
const sections = {};
import memories from '../data/memories.json' assert {type: 'json'};

//***********//
//* ON LOAD *//
//***********//


// CREATING SECTIONS (A SECTION CONTAINS MULTIPLE ARTICLES) //

// Copy the template_section and add it dynamically to the DOM
// Add all sections which are defined in the sectionIds array

for (const sectionId of sectionIds) {
  const $section = $templ_section.cloneNode(true);

  $section.id = sectionId;
  sections[sectionId] = $section;

  $main.querySelector("section:first-of-type").after($section);

  // Add Eventlistener for every single arrow button
  // When clicking on left/right arrow, then move the articles to the right / left
  const $articleContainer = $section.querySelector(".articles");
  const $slideMemory = $section.querySelectorAll(".slide-memory");

  for (const $slideElement of $slideMemory){
    $slideElement.addEventListener("click", (e) => {
      const scrollDirection = e.target.classList.contains("arrow-right") ? 1 : -1;
      $articleContainer.scrollBy({
        left : scrollDirection * ($articleContainer.firstChild?.offsetWidth + 20),
        behavior: 'smooth'
      });
    });
  }
}

// CREATING MEMORIES (ARTICLES) //

// Loop through the memories, copy the template_memory and add it dynamically to the sections
// Depending on which section category the memory is related to, append it to the correct section

// Create and render Memories
createMemorieEntries(memories);

// Loads the arrow left + right buttons
setSliderButtons();

//**********//
//* EVENTS *//
//***********/


// When resizing the screen the arrow left + right buttons are loaded
window.addEventListener("resize", () => {
  setSliderButtons();
});

// When clicking on the input field "how was your day", then open the dialog
$memoryTitle.addEventListener("click", () => {
  $dialogBackdrop.hidden = false;
  $dialog.setAttribute("open", "");
});

// Eventlistener for selectig set a memory to favorite
$favorite.addEventListener("click", () => {
  $favorite.toggleAttribute("data-favoriteSet");
});

// Eventlistener for selectig an emoji
$emojis.addEventListener("click", (e) => {
  $emojis.querySelector("span[data-selected]").removeAttribute("data-selected");
  e.target.setAttribute("data-selected", "");
});

//
// SAVING A NEW MEMORY
// Eventlistener for clicking the Save Button
$saveMemory.addEventListener("click", () => {

  const test = $favorite.dataset.favoriteset === "" ? true : false;

  console.log(test);

  const data = {
    "entryDate": $memoryDate.value,
    "title": $memoryTitle.value,
    "favorite": $favorite.dataset.favoriteset === "" ? true : false,
    "emoji": $emojis.querySelector("span[data-selected]").textContent,
    "description": $description.value,
    "locations": getTags($locations),
    "activities": getTags($activities),
    "persons": getTags($persons)
  };

  console.log(data);

  // const xhr = new XMLHttpRequest();
  // const params = new URLSearchParams({"data1": "blabla1", "data2": "blabla2"});

  // xhr.open("POST", "/api?setNewMemory", true);
  // xhr.send(params);

  // xhr.addEventListener("load", () => {
  //   console.log(xhr.responseText);
  // });
});

// When clicking outside the dialog, then close it
$dialogBackdrop.addEventListener("click", () => {
  $dialogBackdrop.hidden = true;
  $dialog.removeAttribute("open");
});

//*************//
//* FUNCTIONS *//
//**************/


// Loops through the sections and sets the arrow left + right buttons if more memories are available than can be shown on the screen
function setSliderButtons() {
  const amountVisibleMemories = window.innerWidth <= 1100 ? 1 : 2;

  for (let [ key, value ] of Object.entries(sections)) {
    const $articleContainer = value.children[2].children;

    value.querySelectorAll('.slide-memory').forEach((element) => {
      element.hidden = $articleContainer?.length > amountVisibleMemories ? false : true;
    });
  }
}

function createMemorieEntries(memories) {

  // Get the current date in new Date format
  const currentDate = new Date();
  currentDate.setHours(0,0,0,0)
  const currentDay = currentDate.getDate();

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

    // Get the memory entry date in new Date format
    const memoryDate = new Date(entryDate);
    memoryDate.setHours(0,0,0,0);
    const memoryDay = memoryDate.getDate()

    // Create the memory element and add its properties
    const $memory = $templ_memory.cloneNode(true);
    $memory.querySelector("h4").textContent = entryDate;
    $memory.querySelector("h2").textContent = `${String.fromCodePoint(mood)} ${title}`;
    $memory.querySelector(".prev-description").textContent = description;

    // Set the data from the database to the memory article in the DOM elements
    $memory.dataset.uuid = uuid;
    favorite && $memory.classList.add("favorite");

    // Check if the memory entry should be displayed or not.
    // If it should be displayed, then create the histoy caption

    // Get the date from one week to check if the current memory is within the range
    const oneWeekAgo = new Date();
    oneWeekAgo.setHours(0,0,0,0)
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    // Set the "x days weeks/months/years ago ..." text
    let historyCaption;

    // Recently added (within the last 7 days)
    if (memoryDate >= (oneWeekAgo)){
      const daysAgo = parseInt((currentDate.getTime() - memoryDate.getTime()) / (1000 * 3600 * 24));

      if (daysAgo === 7){
        historyCaption = `<big>${daysAgo/7}</big> week ago ...`;
      } else if (daysAgo === 0){
        historyCaption = `<big>Today</big>`;
      } else {
        historyCaption = `<big>${daysAgo}</big> day${daysAgo !== 1 ? "s" : ""} ago ...`;
      }
      renderMemory($memory, sectionIds[2]);
    }

    // All memories on the same date as today
    else if (currentDay === memoryDay){
      const monthsAgo = getMonthDifference(memoryDate, currentDate);

      if (monthsAgo <= 12 ){
        historyCaption = `<big>${monthsAgo}</big> month${monthsAgo !== 1 ? "s" : ""} ago ...`;
      }else if (monthsAgo % 12 === 0){
        historyCaption = `<big>${monthsAgo / 12}</big> years ago ...`
      }
      renderMemory($memory, sectionIds[1]);
    }

    // Remove the historyCaption from favorite entries
    else if (favorite){
      historyCaption = "";
      renderMemory($memory, sectionIds[0]);
    }

    // Don't render all other memories
    else {
      continue;
    }

    $memory.querySelector("h6").innerHTML = historyCaption;


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
  }
}

// Renders the memory to the correct section
function renderMemory ($memory, sectionId){
  sections[sectionId].querySelector(".articles").append($memory);
}

// Get the entered tags
function getTags($tags){
  const tags = [];
  for (let element of $tags.children){
    tags.push(element.textContent);
  }

  return tags;
}

// Gets the difference of months between two dates
function getMonthDifference(startDate, endDate) {
  return (
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear())
  )
}
