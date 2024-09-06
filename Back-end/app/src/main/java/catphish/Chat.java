package catphish;

import java.util.concurrent.ConcurrentLinkedQueue;

// Some "getter" methods need to be made public for the Jackson API
class Chat {
    static final Integer MAX_MSG_VIEWED = 7;
    static final Integer MAX_CHAR_PER_LINE = 45;
    static final Integer RIGHTSHIFT = 15;

    private ConcurrentLinkedQueue<Message> messages;

    Chat(ConcurrentLinkedQueue<Message> messages) {
        super();
        this.messages = messages;
    }

    Chat() {
        this(new ConcurrentLinkedQueue<Message>());
    }

    public ConcurrentLinkedQueue<Message> getMessages() {
        return this.messages;
    }
}