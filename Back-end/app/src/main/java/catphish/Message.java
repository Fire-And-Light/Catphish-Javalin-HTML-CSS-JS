package catphish;

// Some getter methods need to be made public for the Jackson API
class Message {
    static final Integer MAX_LEN = 250;

    private String author;
    private String message;

    Message() {
        super();
        // For Jackson API
    }

    Message(String sender, String message) {
        super();
        this.author = sender;
        this.message = message;
    }

    public String getAuthor() {
        return this.author;
    }

    public String getMessage() {
        return this.message;
    }
}