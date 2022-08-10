"use strict";

const $form = document.querySelector("#frm_login");
const $register = document.querySelector("#btn_register");
const $submit = document.querySelector('[type="submit"]');
const $pswList = document.querySelectorAll('[type="password"]');

const $validation = document.querySelector("#p_validation");

const pswPattern =
 "^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{6,30}$";
const pswTitle =
  "Min. 6, max. 30 characters, at least one number and one special character (!@#$%^&*_=+-)";

/**********/
/* EVENTS */
/**********/

// When clicking on submit button then we will check some things
// according to which view is selected (login / register) and then
// send the request to the server
// Further we register the xhr eventlistener within the submit eventlistener

$form.addEventListener("submit", (event) => {
  let isLogin = $form.dataset.login === "" ? true : false;

  // Get the username and the password from the form,
  // create a queryString and a XMLHttpRequest
  let username = event.target[0].value;
  let psw = event.target[1].value;

  const params = `username=${username}&password=${psw}`;
  const xhr = new XMLHttpRequest();

  // Listen to the response of the server and check if the
  // login/registration did work
  xhr.addEventListener(
    "load",
    () => {
      // If we get not an status of OK or Forwarded, then inform the user
      // with the proper message according to the current view (login/regiater)
      if (xhr.status !== 200 && xhr.status !== 302) {
        isLogin
          ? alert("Login fehlgeschlagen!")
          : alert("Registrierung fehlgeschlagen!");
        return;
      }
      window.location.href = xhr.responseURL;
    },
    // Because the xhr load listener is created within the
    // submit listener, we only want to create the listener once
    { once: true }
  );

  // Here we are again in the submit listener

  // If we are in the register view, then make the password validation check
  // before send then the request to the server
  if (!isLogin) {
    if ($validation.dataset.matching === "true") {
      xhr.open("post", "/?register", true);
      xhr.send(params);
      return;
    }
    return;
  }
  xhr.open("post", "/?login", true);
  xhr.send(params);
});

// Set an eventListener to toggle between the login view
// and the register view

$register.addEventListener("click", () => {
  if ($form.dataset.login !== undefined) {
    // Click on Sign Up -> switch to register view from sign in view and set action to ?register

    $submit.value = "Sign Up";
    $register.textContent = "Log In";
    $validation.hidden = false;
    $pswList[0].setAttribute("pattern", pswPattern);
    $pswList[0].setAttribute("title", pswTitle);
  } else {

    // Click on Log In -> switch to login view register view and set action to ?login
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
