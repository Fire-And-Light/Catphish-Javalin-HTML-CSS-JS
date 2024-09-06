let url = window.location.href;
let username = url.split("user=")[1];
let profile = document.getElementById("profile");
let match = document.getElementById("match");
let matches = document.getElementById("matches");
let signOut = document.getElementById("signout");
let deleteAcc = document.getElementById("delete");
let section = document.getElementById("section");
let empty = document.getElementById("empty");

loadCandidates();

profile.href = "../profile/profile.html#user=" + username;
match.href = "../match/match.html#user=" + username;
matches.addEventListener("click", reload); // Using this, just in case, due to a past issue
signOut.href = "../main/main.html";
deleteAcc.href = "../delete/delete.html#user=" + username;

async function loadCandidates() {
    section.innerHTML = "";

    let response = await fetch("http://localhost:7070/users/" + username + "/matches");
    response = await response.json();

    if (response.length === 0) {
        empty.className = "empty-on";
        empty.innerHTML = "You have no matches"
        return;
    }

    for (let i = 0; i < response.length; i++) {
        let div = document.createElement("div");
        let match = document.createElement("div");
        let img = document.createElement("img");
        let p = document.createElement("p");

        match.className = "match";

        section.appendChild(div);
        div.appendChild(match);
        match.appendChild(img);
        div.appendChild(p);

        img.src = "data:image/jpeg;base64," + response[i].pictureBlob;
        p.innerHTML = response[i].username;

        img.addEventListener("click", function() {
            window.open("../matchprofile/matchprofile.html#user=" + username + "#match=" + response[i].username, "_self");
        });

        // When the match unmatches the current user, refresh the matches page
        new EventSource("http://localhost:7070/sse").addEventListener(response[i].username + "unmatched" + username, reload);
    }
}

function reload() {
    window.location.reload();
}