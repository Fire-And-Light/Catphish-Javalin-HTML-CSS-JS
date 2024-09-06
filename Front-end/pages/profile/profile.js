let url = window.location.href;
let username = url.split("user=")[1];
let profile = document.getElementById("profile");
let match = document.getElementById("match");
let matches = document.getElementById("matches");
let signOut = document.getElementById("signout");
let deleteAcc = document.getElementById("delete");
let pic = document.getElementById("pic");
let headName = document.getElementById("username");
let bio = document.getElementById("bio");

loadProfile();

let picDiv = document.getElementById("pic-div"); // Use the image divider instead of the actual image to turn on the upload button since the upload button will block the actual image once displayed, thus preventing the upload button of being displayed as soon as it's displayed
let upload = document.getElementById("upload-pic");
let uploadBtn = document.getElementById("upload-btn");
let saveBtn = document.getElementById("save-profile");
let saved = document.getElementById("saved");

profile.addEventListener("click", reload); // Using this, just in case, due to a past issue
match.href = "../match/match.html#user=" + username;
matches.href = "../matches/matches.html#user=" + username;
signOut.href = "../main/main.html";
deleteAcc.href = "../delete/delete.html#user=" + username;

picDiv.addEventListener("mouseenter", uploadPicPrompt);
picDiv.addEventListener("mouseleave", removeUploadPicPrompt);
upload.addEventListener("change", uploadPic);
saveBtn.addEventListener("click", saveProfile);

async function loadProfile() {
    headName.innerHTML = username;
    let response = await fetch("http://localhost:7070/users/" + username + "/profile");
    response = await response.json();
    pic.src = "data:image/jpeg;base64," + response.pictureBlob; // The blob must be preceded as such for JS to display the image from the blob
    bio.value = response.bio;
}

function reload() {
    window.location.reload();
}

function uploadPicPrompt() {
    uploadBtn.style.display = "block";
}

function removeUploadPicPrompt() {
    uploadBtn.style.display = "none";
}

function uploadPic() {
    let chosenPic = this.files[0];

    if (chosenPic) {
       let reader = new FileReader();

       reader.addEventListener("load", function() {
        pic.src = reader.result;
       });

       reader.readAsDataURL(chosenPic);
    }
}

async function saveProfile() {
    let account = {
        username: username,
        pictureBlob: pic.src,
        bio: bio.value
    }

    let request = {
        method: "PUT",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(account)
    }

    await fetch("http://localhost:7070/users/" + username + "/profile", request);
    showConfirmation();
}

function showConfirmation() { // This works sometimes and not othertimes. Changing the code hasn't changed its behavior. I shouldn't have even needed to change the code before since it was never tampered with and since the second front-end implementation is exactly the same as this one. As of now, it's working, so I'm done tampering with this code
    saved.innerHTML = "Saved!";
    setTimeout(hideConfirmation, 5000);
}

function hideConfirmation() {
    saved.innerHTML = "";
}