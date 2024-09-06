let url = window.location.href;
let username = url.split("user=")[1].split("#")[0];
let matchname = url.split("match=")[1];
let nav = document.getElementById("nav");
let profile = document.getElementById("profile");
let match = document.getElementById("match");
let matches = document.getElementById("matches");
let signOut = document.getElementById("signout");
let deleteAcc = document.getElementById("delete");
let pic = document.getElementById("pic");
let profileHead = document.getElementById("profilehead");
let bio = document.getElementById("bio");
let chatHead = document.getElementById("chathead");
let chat = document.getElementById("chatbody");
let message = document.getElementById("message");
let send = document.getElementById("send");
let unmatch = document.getElementById("unmatch");

loadMatch();
loadChat();

profile.href = "../profile/profile.html#user=" + username;
match.href = "../match/match.html#user=" + username;
matches.addEventListener("click", leavePage); // Using this, just in case, due to a past issue
signOut.href = "../main/main.html";
deleteAcc.href = "../delete/delete.html#user=" + username;
send.addEventListener("click", sendMessage);
unmatch.addEventListener("click", unmatchProfile);

// When the match sends a message to the current user, load the chat for the current user
new EventSource("http://localhost:7070/sse").addEventListener(matchname + "messaged" + username, loadChat);

// When the match unmatches the current user, send the current user to the "matches" page
new EventSource("http://localhost:7070/sse").addEventListener(matchname + "unmatched" + username, leavePage);

async function loadMatch() {
    let response = await fetch("http://localhost:7070/users/" + username + "/matches/" + matchname);
    response = await response.json();
    profileHead.innerHTML = response.username;
    pic.src = "data:image/jpeg;base64," + response.pictureBlob;
    bio.value = response.bio;
    chatHead.innerHTML = response.username;
}

async function loadChat() {
    let response = await fetch("http://localhost:7070/users/" + username + "/matches/" + matchname + "/chat");
    response = await response.json();
    chat.innerHTML = "";

    for (let i = 0; i < response.length; i++) {
        let p = document.createElement("p");

        if (response[i].author === username) {
            p.className = "message user";

        } else {
            p.className = "message";
        }

        p.innerHTML = response[i].message;
        chat.appendChild(p);
        chat.scrollTop = chat.scrollHeight - chat.clientHeight;
    }
}

async function sendMessage() {
    if (message.value === "") {
        return;
    }

    let messageSent = {
        message: message.value
    };

    let request = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(messageSent)
    }

    let p = document.createElement("p");
    p.className = "message user";
    p.innerHTML = message.value;
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;

    await fetch("http://localhost:7070/users/" + username + "/matches/" + matchname + "/chat", request);

    message.value = "";
}

async function unmatchProfile() {
    let request = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
    }

    await fetch("http://localhost:7070/users/" + username + "/matches/" + matchname + "/unmatch", request);
    window.open("../matches/matches.html#user=" + username, "_self");
}

function leavePage() {
    window.open("../matches/matches.html#user=" + username, "_self");
}