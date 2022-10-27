"use strict";

const $main = document.querySelector("main");

// Template DOM elements
const $templ_section = document.querySelector("#template_section").content.firstElementChild;
const $templ_memory = document.querySelector("#template_memory").content.firstElementChild;

const $dialogFilter = document.querySelector("#dialog_filter");
const $toggleFilterDialog = document.querySelector("#span_toggleFilter");

const $dialogMemory = document.querySelector("#dialog_memory");
const $dialogBackdrop = document.querySelector("#div_dialogBackdrop");
const $closeDialogMemory = document.querySelector("#img_closeNewEntryDialog");

const $memoryTitle = document.querySelector("#inp_title");
const $memoryDate = document.querySelector("#inp_entryDate");
const $favorites = document.querySelectorAll(".img-favorite");
const $favoriteFilter = $favorites[0];
const $favoriteNewEntry = $favorites[1];

const $emojiContainers = document.querySelectorAll(".emojis-container");
const $emojiContainerFilter = $emojiContainers[0];
const $emojiContainerNewEntry = $emojiContainers[1];

const $description = document.querySelector("#ta_description");
const $locations = document.querySelector("#span_locations");
const $activities = document.querySelector("#span_activities");
const $persons = document.querySelector("#span_persons");
const $tagParents = document.querySelectorAll(".icon-tags");

const $saveMemory = document.querySelector("#btn_saveMemory");

// sectionIds stores the ids of all the possible memory sections
const sectionIds = ["section_favorites", "section_timelineAll", "section_timelineRecentlyAdded"];

// sections stores all created sections DOM elements
const sections = {};

// Array will be filled with memories from the db
let memories = [];

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

// Initially load the dashboard
loadDashboard();

//**********//
//* EVENTS *//
//***********/

// Resizing window
// When resizing the screen the arrow left + right buttons are loaded
window.addEventListener("resize", () => {
  setSliderButtons();
});

// Mouse click into title
// When clicking on the input field "how was your day", then open the dialog
$memoryTitle.addEventListener("click", () => {
  $dialogBackdrop.hidden = false;
  $dialogMemory.setAttribute("open", "");

  // Close the filter dialog when opening the new entry dialog
  $dialogFilter.open = false;
});

// Mouse click into a favorite symbol (filter and new entry)
// Eventlistener for setting a memory to favorite
for(let $favorite of $favorites) {
  $favorite.addEventListener("click", (e) => {
    e.target.toggleAttribute("data-favoriteSet");
  });
}

// Enter click in tag input fields
// Add eventlistener to the tags input (When entering a tag and click enter, then display the entered string below the tags element)
$tagParents.forEach(($tagParent) => {
  const $input = $tagParent.querySelector(".tag-input");
  const $tags = $tagParent.querySelector(".tags");

  $input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && $input.value.trim()){
      const $tag = document.createElement("span");
      $tag.textContent = $input.value;
      $input.value = "";
      $tags.append($tag);

      // Add eventlistener to the tags delete symbol (Deleting an tag)
      $tag.addEventListener("click", (e) => {
        deleteTag($tag, e);
      });
    }
  });
});

//
// SAVING A NEW MEMORY (XHR)
// Eventlistener for clicking the Save Button
$saveMemory.addEventListener("click", () => {

  // If title and date is empty, don't save the memory
  if(!$memoryTitle.value.trim() || !$memoryDate.value){
    alert("Title and date must be filled out");
    return;
  }

  // Collection the data which where entered in the dialogMemory
  const data = {
    "uuid": $dialogMemory.dataset.uuid,
    "entry_date": $memoryDate.value,
    "title": $memoryTitle.value.trim(),
    "favorite": $favoriteNewEntry.dataset.favoriteset === "" ? 1 : 0,
    "emoji": $emojiContainerNewEntry.querySelector("span[data-selected]").textContent,
    "description": $description.value.trim(),
    "url": "URL",
    "locations": getTags($locations).join("; "),
    "activities": getTags($activities).join("; "),
    "persons": getTags($persons).join("; ")
  };

  // Preparing the xhr and send it to the server
  const xhr = new XMLHttpRequest();
  const params = new URLSearchParams(data);

  xhr.open("POST", "/api?setMemory", true);
  xhr.send(params);

  xhr.addEventListener("load", () => {
    if(xhr.status === 200 & xhr.readyState === 4){
      alert("Memory saved successfully!");

      clearDialogData();
      $dialogBackdrop.hidden = true;
      $dialogMemory.removeAttribute("open");

      // After a memory was saved/updated, refresh the dashboard
      loadDashboard();
    }
  });
});

// Mouse click outside dialog new  memory
// When clicking outside the dialog, then close it
$dialogBackdrop.addEventListener("click", () => {
  clearDialogData();
  closeNewEntryDialog();
});

$closeDialogMemory.addEventListener("click", () => {
  closeNewEntryDialog();
});

// Mouse click onto filter symbol
// When clicking onto the filter symbol then toggle the filter dialog
$toggleFilterDialog.addEventListener("click", () => {
  $dialogFilter.toggleAttribute("open");
});

//*************//
//* FUNCTIONS *//
//**************/

// Loading the dashboard with memories from the db
function loadDashboard() {
  // Load memories from the db
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/api?getMemories&all", true);
  xhr.send();

  xhr.addEventListener("load", () => {
    memories = JSON.parse(xhr.responseText);

    // CREATING MEMORIES (ARTICLES) //

    // Create and render Memories
    createMemoryEntries(memories);

    // Show/hide edit and delete buttons when hover/leave an memory
    for (let $memory of $main.querySelectorAll("article")) {

      $memory.addEventListener("mouseover", () => {
        $memory.querySelector('.edit').hidden = false;
        $memory.querySelector('.delete').hidden = false;
      })

      $memory.addEventListener("mouseleave", () => {
        $memory.querySelector('.edit').hidden = true;
        $memory.querySelector('.delete').hidden = true;
      })
    }

    // Loads the arrow left + right buttons
    setSliderButtons();

    // Load emoji bars
    loadEmojis();
  });
}

function createMemoryEntries(memories) {
  // Loop through the memories, copy the template_memory and add it dynamically to the sections
  // Depending on which section category the memory is related to, append it to the correct section

  // Get the current date in new Date format
  const currentDate = new Date();
  currentDate.setHours(0,0,0,0)
  const currentDay = currentDate.getDate();

  // Reset the object which contains all al memories to be rendered
  resetRenderedMemories();

  for (const {
    uuid,
    entry_date,
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
    const memoryDate = new Date(entry_date);

    memoryDate.setHours(0,0,0,0);
    const memoryDay = memoryDate.getDate()

    // Get the date from one week to then check if the current memory is within the range
    const oneWeekAgo = new Date();

    oneWeekAgo.setHours(0,0,0,0)
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    // Create the memory element and add its properties
    // The memory element is the main content for representing a single memory entry
    const $memory = $templ_memory.cloneNode(true);

    $memory.querySelector("h4").textContent = entry_date;
    $memory.querySelector("h2").textContent = `${mood} ${title}`;
    $memory.querySelector(".prev-description").textContent = description;

    // Set the data from the database to the memory article in the DOM elements
    $memory.dataset.uuid = uuid;
    favorite && $memory.classList.add("favorite");

    // Check if the memory entry should be displayed or not.
    // If it should be displayed, then create the histoy caption.
    // Set the "x days weeks/months/years ago ..." text
    let historyCaption;

    // SECTION Recently added (within the last 7 days)
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

    // SECTION All memories on the same date as today
    else if (currentDay === memoryDay){
      const monthsAgo = getMonthDifference(memoryDate, currentDate);

      if (monthsAgo <= 12 ){
        historyCaption = `<big>${monthsAgo}</big> month${monthsAgo !== 1 ? "s" : ""} ago ...`;
      }else if (monthsAgo % 12 === 0){
        historyCaption = `<big>${monthsAgo / 12}</big> years ago ...`
      }
      // Don't render all other memories
      else {
        continue;
      }
      renderMemory($memory, sectionIds[1]);
    }

    // SECTION favorites - Remove the historyCaption from favorite entries
    else if (favorite){
      historyCaption = "";
      renderMemory($memory, sectionIds[0]);
    }

    // Don't render all other memories
    else {
      continue;
    }

    // Finally set the correct historyCaption to the element
    $memory.querySelector("h6").innerHTML = historyCaption;

    //
    // Load the correct tag values for each tag (locations, activities and persons)

    // Loop through the locations array and render the values to the DOM
    for (const location of locations.split("; ")) {
      const p = document.createElement("p");
      p.textContent = location ? location : "-";
      $memory.querySelector(".locations").append(p);
    }

    // Loop through the activities array and render the values to the DOM
    for (const activity of activities.split("; ")) {
      const p = document.createElement("p");
      p.textContent = activity ? activity : "-";
      $memory.querySelector(".activities").append(p);
    }

    // Loop through the persons array and render the values to the DOM
    for (const person of persons.split("; ")) {
      const p = document.createElement("p");
      p.textContent = person ? person : "-";
      $memory.querySelector(".persons").append(p);
    }

    //
    // Edit and Delete Button functions
    //

    // Add eventlistener to the edit button
    // This loads the data from the entry, opens the dialogMemory and sets the correct values to the fields
    $memory.querySelector(".edit").addEventListener(("click"), (e) => {

      // Set the dialog data (popup for entering/updating memories) with the loaded data from the db
      setDialogData({uuid, entry_date, favorite, mood, title, description, locations, activities, persons, images});

      // open the dialogMemory
      $dialogBackdrop.hidden = false;
      $dialogMemory.setAttribute("open", "");

      // Close the filter dialog when opening the new entry dialog
      $dialogFilter.open = false;
    });

    //
    // DELETING A MEMORY (XHR)
    // Add eventlistener to the delete button
    $memory.querySelector(".delete").addEventListener(("click"), (e) => {

      // Safety check if the user really want to delete the memory
      if(!confirm("Do you really want to delete the memory?")) return;

      // Preparing the xhr and send it to the server
      const xhr = new XMLHttpRequest();
      const params = new URLSearchParams({"uuid": uuid});

      xhr.open("POST", "/api?deleteMemory", true);
      xhr.send(params);

      xhr.addEventListener("load", () => {
        if(xhr.status === 200 & xhr.readyState === 4){
          alert("Memory deleted successfully!");

          // After a memory was deleted, refresh the dashboard
          loadDashboard();
        }
      });
    });
  }
}

// Renders the memory to the correct section
function renderMemory ($memory, sectionId){
  sections[sectionId].querySelector(".articles").append($memory);
  sections[sectionId].toggleAttribute("hidden", false);
}

// Resets the object which contains all the rendered memories
function resetRenderedMemories() {
  for (const sectionId of sectionIds) {
    sections[sectionId].querySelector(".articles").innerHTML = "";
    sections[sectionId].toggleAttribute("hidden", true);
  }
}

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

// Get the entered tags from the dialog field (new/update)
function getTags($tags){
  const tags = [];
  for (let element of $tags.children){
    tags.push(element.textContent);
  }
  return tags;
}

// Clear the values of the fields within the dialogMemory
function clearDialogData() {
  $dialogMemory.dataset.uuid = "";
  $memoryDate.value = "";
  $memoryTitle.value = "";
  $favoriteNewEntry.toggleAttribute("data-favoriteset", false);
  $emojiContainerNewEntry.querySelector("span[data-selected]").removeAttribute("data-selected");
  $emojiContainerNewEntry.querySelector("span:first-child").setAttribute("data-selected","");
  $description.value = "";
  $locations.innerHTML = "";
  $activities.innerHTML = "";
  $persons.innerHTML = "";
}

//
// Loading dialog values
// Sets the values of the fields within the dialog
function setDialogData(data) {
  const tags = [data.locations, data.activities, data.persons];

  $dialogMemory.dataset.uuid = data.uuid;
  $memoryDate.value = data.entry_date;
  $memoryTitle.value = data.title;
  $favoriteNewEntry.toggleAttribute("data-favoriteset", data.favorite);
  $description.value = data.description;
  // Set the correct emoji
  for (let mood of $emojiContainerNewEntry.children){
    if (mood.textContent === data.mood){
      $emojiContainerNewEntry.querySelector("span[data-selected]").removeAttribute("data-selected");
      mood.setAttribute("data-selected","");
    }
  }

  // Loading the tags
  // Loop through the different tags (locations, activities and persons) and set the tags (array) to the correct span element
  for (let index in tags){
    let $tagContainer = $tagParents[index].querySelector(".tags");
    for (let tag of tags[index].split("; ")){
      // set only tags which contain data
      if (tag.length){
        let $tag = document.createElement("span");

        $tag.textContent = tag;
        $tagContainer.append($tag);

        // Add eventlistener to the tags delete symbol (Deleting an tag)
        $tag.addEventListener("click", (e) => {
          deleteTag($tag, e);
        });
      }
    }
  }
}

// Deleting the tags with the X symbol
// This function will be the callback function of the click event of the X
function deleteTag($tag, e) {
  const xImgWidth = 13;
  // A direct click on the pseudo element ::after is not possible,
  // so check the coordinates of the click event and delete the tag
  if(e.offsetX > (e.target.offsetLeft + e.target.offsetWidth - xImgWidth)){
    $tag.remove();
  }
}

// Emojy creation
// Creates the content for the emojis-container set the click
// events and renders it to the filter and new memory dialog
function loadEmojis() {
  const emojis = ["😅", "😇", "😈", "😌","😍","😎","😑","😓","😔","😕","😢","😭","😴","😵","🤪","🤬","🤯","🤮","🤒","🤕"];

  for(let $emojiContainer of $emojiContainers) {
    $emojiContainer.innerHTML = "";
    for( let index in emojis){
      const $span = document.createElement("span");

      $span.textContent = emojis[index];
      if(index === "0") {
        $span.setAttribute("data-selected", "");
      }
      $emojiContainer.append($span);
    }

    // Mouse click onto an emoji
    // Eventlistener for selectig an emoji
    $emojiContainer.addEventListener("click", (e) => {
      $emojiContainer.querySelector("span[data-selected]").toggleAttribute("data-selected", false);
      e.target.setAttribute("data-selected", "");
    });

  }
}

// This function closes the new entry dialog
function closeNewEntryDialog() {
  $dialogBackdrop.hidden = true;
  $dialogMemory.removeAttribute("open");
}

// Gets the difference of months between two dates
function getMonthDifference(startDate, endDate) {
  return (
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear())
  )
}
