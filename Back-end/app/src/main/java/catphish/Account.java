package catphish;

import java.util.HashSet;

// This is not fully consistent with a database account for the sake of space
// Some "getter" methods need to be made public for the Jackson API
class Account {
    // I didn't add a minimum password length for the convenience of testing
    static final Integer MAX_NAM_LEN = 20;
    static final Integer MAX_PAS_HASH_LEN = 384;
    static final Integer MAX_PAS_SALT_LEN = 32;
    static final Integer MAX_PIC_LEN = 8000;
    static final Integer MAX_BIO_LEN = 1000;

    private String username;
    private String password;
    
    // Only one picture is supported
    private String picturePath;
    private String pictureBlob;

    private String bio;
    private HashSet<String> checked;
    private HashSet<String> liked;

    Account() { // For Jackson API
        super();
    }

    Account(String username, String picturePath, String bio,
        HashSet<String> checked,
        HashSet<String> liked) {
        super();
        this.username = username;
        this.picturePath = picturePath;
        this.bio = bio;
        this.checked = checked;
        this.liked = liked;
    }

    public String getUsername() {
        return this.username;
    }

    void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return this.password;
    }

    public String getPicturePath() {
        return this.picturePath;
    }

    void setPicturePath(String picture) {
        this.picturePath = picture;
    }

    void printPicturePath() {
        System.out.println(this.picturePath);
    }

    public String getPictureBlob() {
        return this.pictureBlob;
    }

    void setPictureBlob(String pictureBlob) {
        this.pictureBlob = pictureBlob;
    }

    public String getBio() {
        return this.bio;
    }

    void setBio(String bio) {
        this.bio = bio;
    }

    void printBio() {
        System.out.println(this.bio);
    }

    HashSet<String> getChecked() {
        return this.checked;
    }

    void addChecked(String username) {
        this.checked.add(username);
    }

    HashSet<String> getLiked() {
        return this.liked;
    }

    void addLiked(String username) {
        this.liked.add(username);
    }

    void removeLiked(String username) {
        this.liked.remove(username);
    }
}