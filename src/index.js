"use strict";

const $form = document.querySelector("#frm_login");
const $register = document.querySelector("#btn_register");
const $submit = document.querySelector('[type="submit"]');

// Set an eventListener to toggle between the login view
// and the register view

$register.addEventListener("click", () => {
  if ($form.getAttribute("data-login") !== null) {
    // switch to register view and set action to ?register

    $form.setAttribute("action", "/?register");
    $submit.value = "Registrieren";
    $register.textContent = "Einloggen";
  } else {
    // switch to login view and set action to ?login

    $form.setAttribute("action", "/?login");
    $submit.value = "Einloggen";
    $register.textContent = "Registrieren";
  }

  // Toogle the second password input field and the data-login attribute in frm_login
  document.querySelectorAll('[type="password"]')[1].toggleAttribute("hidden");
  $form.toggleAttribute("data-login");
});
