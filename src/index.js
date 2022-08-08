"use strict";

const $form = document.querySelector("#frm_login");
const $register = document.querySelector("#btn_register");
const $submit = document.querySelector('[type="submit"]');
const $pswList = document.querySelectorAll('[type="password"]');

const $validation = document.querySelector("#p_validation");

const pswPattern = "(?=.*[a-zA-Z])(?=.*\d)(?=.*[#$@!%§&*?])[A-Za-z\d#$@!%§&*?]{6,30}$";
const pswTitle = "Min. 6, max. 30 characters, at least one number and one special character (#$@!%§&*?)";

/**********/
/* EVENTS */
/**********/

// Check the password validation before the submit action will be triggered (only in register view)
// First step = Stop the form on submitting
// Second step = Check if the password matches -> If yes, then submit the form

$form.addEventListener("submit", (event) => {
  if($form.dataset.login === undefined){
    event.preventDefault();
    if ($validation.dataset.matching === "true") {
      $form.submit();
    }
  }
});

// Set an eventListener to toggle between the login view
// and the register view

$register.addEventListener("click", () => {
  if ($form.dataset.login !== undefined) {
    // Click on Sign Up -> switch to register view from sign in view and set action to ?register

    $form.setAttribute("action", "/?register");
    $submit.value = "Sign Up";
    $register.textContent = "Log In";
    $validation.hidden = false;
    $pswList[0].setAttribute("pattern", pswPattern);
    $pswList[0].setAttribute("title", pswTitle);
  } else {
    // Click on Log In -> switch to login view register view and set action to ?login

    $form.setAttribute("action", "/?login");
    $submit.value = "Log In";
    $register.textContent = "Sign Up";
    $validation.hidden = true;
    $pswList[0].removeAttribute("pattern");
    $pswList[0].removeAttribute("title");
  }

  // Toogle the second password input field and the data-login attribute in frm_login

  $form.toggleAttribute("data-login");
  $pswList[1].toggleAttribute("hidden");
  $pswList[1].toggleAttribute("required");
});

// EventListener for validating the repeated password -> Check if the repeated password is the same as the first entered

for (let $element of $pswList) {
  $element.addEventListener("keyup", () => {
    if ($pswList[0].value === $pswList[1].value) {
      $validation.setAttribute("data-matching", true);
      $validation.textContent = "Matching passwords";
    } else {
      $validation.setAttribute("data-matching", false);
      $validation.textContent = "Not matching passwords";
    }
  });
}
