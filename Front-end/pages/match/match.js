let url = window.location.href;
let username = url.split("user=")[1];
let nav = document.getElementById("nav");
let profile = document.getElementById("profile");
let match = document.getElementById("match");
let matches = document.getElementById("matches");
let signOut = document.getElementById("signout");
let deleteAcc = document.getElementById("delete");
let section = document.getElementById("section");
let cover = document.getElementById("cover");
let pic = document.getElementById("pic");
let candidate = document.getElementById("candidate");
let bio = document.getElementById("bio");
let times = document.getElementById("times");
let check = document.getElementById("check");
let message = document.getElementById("message");
let canClick = true;

loadCandidate();

// "href" isn't used here since it logic is needed to prevent redirection when the "MATCHED" message appears, so event listeners are used instead
profile.addEventListener("click", enterProfile);
match.addEventListener("click", reload);
matches.addEventListener("click", enterMatches);
signOut.addEventListener("click", enterMain);
deleteAcc.addEventListener("click", enterDelete);

times.addEventListener("click", reject);
check.addEventListener("click", like);

async function loadCandidate() {
    let response = await fetch("http://localhost:7070/users/" + username + "/match");
    response = await response.json();

    if (response.username === null) {
        cover.className = "cover-off";
        message.className = "empty";
        message.innerHTML = "There are no people";
        return;

    } else {
        cover.className = "cover-on";
    }

    candidate.innerHTML = response.username;
    pic.src = "data:image/jpeg;base64," + response.pictureBlob;
    bio.value = response.bio;
}

function enterProfile() {
    if (canClick) {
        window.open("../profile/profile.html#user=" + username, "_self");
    }
}

function reload() {
    if (canClick) {
        window.location.reload();
    }
}

function enterMatches() {
    if (canClick) {
        window.open("../matches/matches.html#user=" + username, "_self");
    }
}

function enterMain() {
    if (canClick) {
        window.open("../main/main.html", "_self");
    }
}

function enterDelete() {
    if (canClick) {
        window.open("../delete/delete.html#user=" + username, "_self");
    }
}

async function reject() {
    if (canClick) {
        let relationship = {
            candidate: candidate.innerHTML,
            liked: "false"
        }
    
        let request = {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
    
            body: JSON.stringify(relationship)
        }
    
        await fetch("http://localhost:7070/users/" + username + "/match", request);
    
        loadCandidate();
    }
}

async function like() {
    if (canClick) {
        let relationship = {
            candidate: candidate.innerHTML,
            liked: "true"
        }
    
        let request = {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
    
            body: JSON.stringify(relationship)
        }
    
        let response = await fetch("http://localhost:7070/users/" + username + "/match", request);
        response = await response.text();
        let matched = response === "Matched";
    
        if (matched) {
            notifyMatched();
            setTimeout(loadCandidate, 1500);
    
        } else {
            loadCandidate();
        }
    }
}

function notifyMatched() {
    canClick = false;

    let options = document.getElementsByTagName("a");

    for (let i = 0; i < options.length; i++) {
      options[i].style.cursor = "default";

      if (options[i].id != "match") {
        options[i].className = "matched";
      }
    }

    times.style.cursor = "default";
    check.style.cursor = "default";

    nav.style.filter = "brightness(65%)";
    section.style.filter = "brightness(65%)";
    message.className = "message-on";

    setTimeout(unnotifyMatched, 1500);
}

function unnotifyMatched() {
    let options = document.getElementsByTagName("a");

    for (let i = 0; i < options.length; i++) {
      options[i].style.cursor = "pointer";

      if (options[i].id != "match") {
        options[i].className = "unmatched";
      }
    }

    times.style.cursor = "pointer";
    check.style.cursor = "pointer";

    message.className = "message-off";

    nav.style.filter = "brightness(100%)";
    section.style.filter = "brightness(100%)";

    canClick = true;
}