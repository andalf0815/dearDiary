"use strict";

const $main = document.querySelector("main");

// Template DOM elements
const $templ_section = document.querySelector("#template_section").content.firstElementChild;
const $templ_memory = document.querySelector("#template_memory").content.firstElementChild;

const $closeDialogs = document.querySelectorAll(".close-dialog");

const $dialogFilter = document.querySelector("#dialog_filter");
const $closeDialogFilter = $closeDialogs[0];
const $toggleFilterDialog = document.querySelector("#span_toggleFilter");
const $filterSearch = document.querySelector("#inp_filterText");
const $radiosFavorite = document.querySelectorAll("input[name=rb-favorite]");
const $searchMemories = document.querySelector("#btn_searchMemories");

const $dialogMemory = document.querySelector("#dialog_memory");
const $dialogBackdrop = document.querySelector("#div_dialogBackdrop");
const $closeDialogMemory = $closeDialogs[1];

const $memoryTitle = document.querySelector("#inp_title");
const $memoryDate = document.querySelector("#inp_entryDate");
const $favoriteNewEntry = document.querySelector(".img-favorite");

const $emojiContainers = document.querySelectorAll(".emojis-container");
const $emojiContainerFilter = $emojiContainers[0];
const $emojiContainerNewEntry = $emojiContainers[1];

const $description = document.querySelector("#ta_description");

const $imgToUpload = document.querySelector("#inp_imgToUpload");
const $imgPreviewContainer = document.querySelector("#div_imgPreviewContainer");

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

// Mouse click into a favorite symbol
// Eventlistener for setting a memory to favorite
$favoriteNewEntry.addEventListener("click", (e) => {
  e.target.toggleAttribute("data-favoriteSet");
});

// Mouse click on "Select Files"
// When clicking on "Select Files" and choose images, then create a preview
// of those images in the div_imgPreviewContainer
$imgToUpload.addEventListener("change", () => {
  const files = $imgToUpload.files;

  // Reset preview container
  $imgPreviewContainer.innerHTML = "";

  // Max 4 images per memory are allowed to upload
  if (files.length < 1 || files.length > 4) return;

  // Loop through the selected images
  // Then create a File reader to read the file and get the base64 code from it
  for (let file of files){
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // After the reader finished to read the file,
    // create a temporary img element to draw a canvas and
    // reduce the resolution (to save space on the db)
    // Then get the new base64 code from the comprimized image to then save it
    reader.addEventListener("load", (e) => {
      const $imgTemp = document.createElement("img");
      $imgTemp.src = e.target.result;

      $imgTemp.addEventListener("load", (e) => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;

        const scaleSize = MAX_WIDTH / e.target.width;
        canvas.width = MAX_WIDTH;
        canvas.height = e.target.height * scaleSize;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);

        const srcEncoded = ctx.canvas.toDataURL(e.target, "image/png");
        const $img = document.createElement("img");
        $img.className = "img-preview";
        $img.src = srcEncoded;
        $imgPreviewContainer.append($img);
      })
    });
  }
})


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
// Eventlistener for clicking the Save button
$saveMemory.addEventListener("click", () => {

  // If title and date is empty, don't save the memory
  if(!$memoryTitle.value.trim() || !$memoryDate.value){
    alert("Title and date must be filled out");
    return;
  }

  $dialogBackdrop.hidden = true;
  $dialogMemory.removeAttribute("open");

  const imageBase64Collection = [ ...$imgPreviewContainer.children ];

  // Joining the array of base64 code with the separator ;; so that it can be later easily splitted
  const imgB64 = imageBase64Collection.map((entry) => entry.src).join(";;");
 
  // Collection the data which where entered in the dialogMemory
  const data = {
    "uuid": $dialogMemory.dataset.uuid,
    "entry_date": $memoryDate.value,
    "title": $memoryTitle.value.trim(),
    "favorite": $favoriteNewEntry.dataset.favoriteset === "" ? 1 : 0,
    "mood": $emojiContainerNewEntry.querySelector("span[data-selected]").textContent,
    "description": $description.value.trim(),
    "images": imgB64,
    "locations": getTags($locations).join("; "),
    "activities": getTags($activities).join("; "),
    "persons": getTags($persons).join("; ")
  };

  clearDialogData();

  // Preparing the xhr and send it to the server
  const xhr = new XMLHttpRequest();
  const params = new URLSearchParams(data);

  xhr.open("POST", "/api?setMemory", true);
  xhr.send(params);

  xhr.addEventListener("load", () => {
    if(xhr.status === 200 & xhr.readyState === 4){
      alert("Memory saved successfully!");
      data.uuid = xhr.responseText;
      createMemoryEntries([data], false, false);
    }
  });
});

// Mouse click outside dialog new  memory
// When clicking outside the dialog, then close it
$dialogBackdrop.addEventListener("click", () => {
  clearDialogData();
  closeNewEntryDialog();
  closeFilterDialog();
});

// Mouse click onto closing dialogs X symbol
// When clicking on the X ymbol in the dialogs, then close it

for (let $closeDialog of $closeDialogs){
  $closeDialog.addEventListener("click", () => {
    if ($closeDialog === $closeDialogMemory){
      clearDialogData();
      closeNewEntryDialog();
    }else {
      closeFilterDialog();
    }
  });
}

// Mouse click onto filter symbol
// When clicking onto the filter symbol then toggle the filter dialog
$toggleFilterDialog.addEventListener("click", () => {
  // If a filter is already set then reset the filter when clicking on the symbol
  // Trigger the removeAttribute after the loadDashboard is finished,
  // so no delay will be noticed
  if ($toggleFilterDialog.hasAttribute("data-filtered")) {
    loadDashboard(false, resetFilterIndication);
    return;
  }

  // Open filter popup
  $dialogBackdrop.hidden = false;
  $dialogFilter.toggleAttribute("open");
});

// Mouse click on search memory filter
// When clicking onto the search button then get the set the filter object and load the dashboard
$searchMemories.addEventListener("click", () => {
  let favoriteFilter = 2;

  for (let radioFavorite of $radiosFavorite) {
    if (radioFavorite.checked){
      favoriteFilter = radioFavorite.defaultValue;
      break;
    }
  }

  const filter = {
    "$search": $filterSearch.value,
    "$favorite": favoriteFilter,
    "$mood": $emojiContainerFilter.querySelector("span[data-selected]").textContent
  };

  loadDashboard(filter);

  // Reset filter to defaut values
  $filterSearch.value = "";
  $radiosFavorite[2].click();

  // Close filter popup
  closeFilterDialog();
});

//*************//
//* FUNCTIONS *//
//**************/

// Loading the dashboard with memories from the db
function loadDashboard(filter = null, cb = null) {
  // Load memories from the db
  const xhr = new XMLHttpRequest();

  // Check if a filter is set or not
  // If yes, then we will change the way how the the memories are rendered,
  // because we don't render special times spans anymore (today one year/month/... ago, ...)
  const filterSet = filter ? true : false;

  filter = {"getMemories": "", ...filter};
  let params = new URLSearchParams(filter);

  xhr.open("GET", `/api?${params}`, true);
  xhr.send();

  xhr.addEventListener("load", () => {
    memories = JSON.parse(xhr.responseText);

    if (filterSet) {
      $toggleFilterDialog.setAttribute("data-filtered","");
      $toggleFilterDialog.textContent = memories.length;
    } else {
      $toggleFilterDialog.removeAttribute("data-filtered");
    }

    // CREATING MEMORIES (ARTICLES) //

    // Create and render Memories
    createMemoryEntries(memories, filterSet, true);

    // Loads the arrow left + right buttons
    setSliderButtons();

    // Load emoji bars
    loadEmojis();

    // If a callback function was passed as parameter then call it
    if (cb){
      cb();
    }

  });
}

function createMemoryEntries(memories, filterSet, refresh) {
  // Loop through the memories, copy the template_memory and add it dynamically to the sections
  // Depending on which section category the memory is related to, append it to the correct section
  // Get the current date in new Date format
  const currentDate = new Date();
  currentDate.setHours(0,0,0,0)
  const currentDay = currentDate.getDate();

  // We need this to spread the memories across every section, when a filter is activated
  // So we have a nicer overview of the searched memories
  const memoriesAmount = memories.length;
  const memoriesPerSection = memoriesAmount / 3;
  let memoriesCounter = 0;
  let sectionIndex = 2;

  // Get the memories from $main.querySelectorAll("article") and check if the current parameter memories contains it, when yes, then remove it and let it be rendered
  const currentlyRenderedMemories = [...$main.querySelectorAll("article")];
  if (refresh || currentlyRenderedMemories.length === 0 || !filterSet) {
    // Reset the object which contains all memories to be rendered
    resetRenderedMemories();
  } else {
    currentlyRenderedMemories.map($memory => {
      if ($memory.dataset.uuid === memories[0].uuid){
        $memory.remove();
      }
    })
  }

  for (let {
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

    // If a filter is set, we render every result of the filter spread to the sections
    // If no filter is set, we will render according to our defined sections
    if (filterSet) {
      if (memoriesCounter < memoriesPerSection){
        renderMemory($memory, sectionIds[sectionIndex]);
        memoriesCounter++;
      }else {
        memoriesCounter = 1;
        sectionIndex--;
        renderMemory($memory, sectionIds[sectionIndex]);
      }
    }else {
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
          renderMemory($memory, sectionIds[1]);
        }else if (monthsAgo % 12 === 0){
          historyCaption = `<big>${monthsAgo / 12}</big> years ago ...`;
          renderMemory($memory, sectionIds[1]);
        }
        // Show memory in favorite section
        else if (favorite){
          historyCaption = "";
          renderMemory($memory, sectionIds[0]);
        }
        // Don't render all other memories
        else {
          continue;
        }
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
    }

    // Load the images of the memory entry
    const $images = [...$memory.querySelector(".images").children];

    images = images.split(";;");

    // Loading the images from the database data and put it to the four img tags
    $images.forEach(($img, index) => {

      // If no image from a memory entry is in the database
      // or no valid base64 code is available, then don't show any img
      if (images[index] && images[index].slice(0, 22) === "data:image/png;base64,"){
        $img.src = images[index];
      } else {
        $img.hidden = true;
      }
    })

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

      $memory.remove();
      // Preparing the xhr and send it to the server
      const xhr = new XMLHttpRequest();
      const params = new URLSearchParams({"uuid": uuid});

      xhr.open("POST", "/api?deleteMemory", true);
      xhr.send(params);
    });

    // When clicking on the magnifying symbol, then maximize the memory entry to see the complete information
    $memory.querySelector(".detail-view").addEventListener("click", () => {
      $memory.toggleAttribute("data-detailview");
    });
  }
}

// Renders the memory to the correct section
function renderMemory ($memory, sectionId){
  sections[sectionId].querySelector(".articles").append($memory);
  sections[sectionId].toggleAttribute("hidden", false);

  // Show/hide detail-view, edit and delete buttons when hover/leave an memory
  $memory.addEventListener("mouseover", () => {
    $memory.querySelector('.edit').hidden = false;
    $memory.querySelector('.delete').hidden = false;
    $memory.querySelector('.detail-view').hidden = false;
  });

  $memory.addEventListener("mouseleave", () => {
    $memory.querySelector('.edit').hidden = true;
    $memory.querySelector('.delete').hidden = true;
    $memory.querySelector('.detail-view').hidden = true;
  });
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
  $imgToUpload.value = "";
  $imgPreviewContainer.innerHTML = "";
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

  // Set the correct images to the dialog new/edit entry
  const images = data.images;

  images.forEach((img, index) => {

    // If no image from a memory entry is in the database
    // or no valid base64 code is available, then don't show any img
    if (img && img.slice(0, 22) === "data:image/png;base64,"){
      const $img = document.createElement("img");
      $img.className = "img-preview";
      $img.src = images[index];
      $imgPreviewContainer.append($img);
    }
  });

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
  const emojis = ["🚫", "😀", "😅", "😇", "😈", "😌","😍","😎","😑","😓","😔","😕","😢","😭","😴","😵","🤪","🤬","🤯","🤮","🤒","🤕"];

  for(let $emojiContainer of $emojiContainers) {
    $emojiContainer.innerHTML = "";

    // For loading the new Entry emojis, delete 🚫 at the beginning of the emojis array
    // Because it's meant to be a filter for any of the emojis
    if ($emojiContainer !== $emojiContainerFilter){
      emojis.shift();
    }

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

      // TO AVOID GLITCHING
      // When a user clicks on an emoji, moves the cursor
      // and releases the mouse click on another position,
      // then the target wouldn't be an emoji, but its emojiContainer itself
      // So skip the click event
      if (e.target === $emojiContainer) return;
      $emojiContainer.querySelector("span[data-selected]").toggleAttribute("data-selected", false);
      e.target.setAttribute("data-selected", "");
    });

  }
}

// This function closes the filter dialog
function closeFilterDialog() {
  $dialogBackdrop.hidden = true;
  $dialogFilter.removeAttribute("open");
}

// This function closes the new entry dialog
function closeNewEntryDialog() {
  $dialogBackdrop.hidden = true;
  $dialogMemory.removeAttribute("open");
}

function resetFilterIndication() {
  $toggleFilterDialog.removeAttribute("data-filtered");
  $toggleFilterDialog.textContent = "";
}

// Gets the difference of months between two dates
function getMonthDifference(startDate, endDate) {
  return (
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear())
  )
}
