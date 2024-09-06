let logo = document.getElementById("logo");
let body = document.getElementsByTagName("body")[0];
let slogan = document.getElementById("slogan");
let signInButton = document.getElementById("signin");
let signUpButton = document.getElementById("signup");
let popupHeader = document.getElementById("popup-header");
let popupTimes = document.getElementById("popup-times");
let popupSubmit = document.getElementById("popup-submit");
let popupError = document.getElementById("popup-error");
let usernameInput = document.getElementById("popup-username");
let passwordInput = document.getElementById("popup-password");

signInButton.addEventListener("click", openPopup);
signInButton.addEventListener("click", configureSignIn);
signUpButton.addEventListener("click", openPopup);
signUpButton.addEventListener("click", configureSignUp);
popupTimes.addEventListener("click", closePopup);

function openPopup() {
    popup.style.display = "block";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundSize = "cover";
    slogan.style.filter = "brightness(78%)";
    logo.style.filter = "brightness(78%)";
    signInButton.style.filter = "brightness(78%)";
    signInButton.style.cursor = "default";
    
    // The only way to change a "hover" option
    let css = "button#signin:hover { background: white; }";
    let style = document.createElement("style");

    if (style.styleSheet) {
        style.styleSheet.cssText = css;

    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName("head")[0].appendChild(style);
}

function configureSignIn() {
    popupHeader.innerHTML = "Log in";
    popupSubmit.addEventListener("click", validateSignIn);

    // Deactivate the "log in" button when the popup is visible
    signInButton.removeEventListener("click", openPopup);
    signInButton.removeEventListener("click", configureSignIn);
}

async function validateSignIn() {
    let username = usernameInput.value;
    let password = passwordInput.value;
    let account = {
        username: username,
        password: password
    }

    let request = {
        method: "POST", // Logins are POST
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(account)
    }

    let response = await fetch("http://localhost:7070/users/" + username, request);
    response = await response.text();
    let success = response === "Signed in!";

    if (success) {
        window.open("../profile/profile.html#user=" + username, "_self");

    } else {
        popupError.innerHTML = response;
    }
}

function configureSignUp() {
    popupHeader.innerHTML = "Create account";
    popupSubmit.addEventListener("click", validateSignUp);
    signInButton.removeEventListener("click", openPopup);
    signInButton.removeEventListener("click", configureSignIn);
}

async function validateSignUp() {
    let username = usernameInput.value;
    let password = passwordInput.value;
    let account = {
        username: username,
        password: password
    }

    let request = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(account)
    }

    let response = await fetch("http://localhost:7070/users", request);
    response = await response.text();
    let success = response === "Account created";

    if (success) {
        window.open("../profile/profile.html#user=" + username, "_self");

    } else {
        popupError.innerHTML = response;
    }
}

function closePopup() {
    popup.style.display = "none";
    slogan.style.filter = "brightness(100%)";
    logo.style.filter = "brightness(100%)";
    signInButton.style.filter = "brightness(100%)";
    signInButton.style.cursor = "pointer";
    signInButton.addEventListener("click", openPopup); // If this event listener was never closed, then adding the same event listener will discard any duplicates
    signInButton.addEventListener("click", configureSignIn);
    popupSubmit.removeEventListener("click", validateSignIn);
    popupSubmit.removeEventListener("click", validateSignUp);
    usernameInput.value = "";
    passwordInput.value = "";
    popupError.innerHTML = "";
    
    let css = "button#signin:hover { background: rgb(185, 185, 185); }";
    let style = document.createElement("style");

    if (style.styleSheet) {
        style.styleSheet.cssText = css;

    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName("head")[0].appendChild(style);
}