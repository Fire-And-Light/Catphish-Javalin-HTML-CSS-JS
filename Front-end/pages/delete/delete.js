let url = window.location.href;
let username = url.split("user=")[1].split("#")[0];
let nav = document.getElementById("nav");
let navList = document.getElementById("navlist");
let profile = document.getElementById("profile");
let match = document.getElementById("match");
let matches = document.getElementById("matches");
let signOut = document.getElementById("signout");
let deleteAcc = document.getElementById("delete");
let confirmBox = document.getElementById("confirm");
let yes = document.getElementById("yes");
let no = document.getElementById("no");
let section = document.getElementById("section");

yes.addEventListener("click", deleteAccount);
no.addEventListener("click", removeConfirmation);

async function deleteAccount() {
    let request = {
        method: "DELETE",
        mode: "cors"
    }

    await fetch("http://localhost:7070/users/" + username, request);
    window.open("../main/main.html", "_self");
}

function removeConfirmation() {
    let options = document.getElementsByTagName("a");
    
    for (let i = 0; i < options.length; i++) {
        options[i].style.cursor = "pointer";
    }

    // The only way to change a "hover" option
    let css = "a:hover { background: rgb(185, 0, 0); color: white; }";
    let style = document.createElement("style");

    if (style.styleSheet) {
        style.styleSheet.cssText = css;

    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName("head")[0].appendChild(style);
    
    nav.style.filter = "brightness(100%)";
    section.style.filter = "brightness(100%)";
    confirmBox.style.display = "none";

    profile.href = "../profile/profile.html#user=" + username;
    match.href = "../match/match.html#user=" + username;
    matches.href = "../matches/matches.html#user=" + username;
    signOut.href = "../main/main.html";
    // I can't use an "href" assignment because the page doesn't completely reload when clicked
    deleteAcc.addEventListener("click", reload);
}

function reload() {
    // Even worse, I can't use "window.location.reload" as the callback function for "deleteAcc". I need an extra function to call "window.location.reload"
    window.location.reload();
}