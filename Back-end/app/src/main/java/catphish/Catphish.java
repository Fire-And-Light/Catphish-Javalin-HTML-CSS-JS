package catphish;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Base64;
import java.util.concurrent.ConcurrentLinkedQueue;
import javax.imageio.ImageIO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.javalin.Javalin;
import io.javalin.core.JavalinConfig;
import io.javalin.http.sse.SseClient;

class Catphish {
    private Logger logger;
    private Javalin server;
    private ConcurrentLinkedQueue<SseClient> clients;
    
    // In VSC, make sure to open this application from the back-end folder so that it runs well
    public static void main(String args[]) {
        Catphish app = new Catphish();
        app.intitialize();
    }

    void intitialize() {
        this.logger = LogManager.getLogger(Catphish.class);
        this.server = Javalin.create(JavalinConfig::enableCorsForAllOrigins);
        this.clients = new ConcurrentLinkedQueue<>();

        this.server.start(7070);

        this.addClient();
        this.signUp();
        this.signIn();
        this.getProfile();
        this.saveProfile();
        this.viewMatch();
        this.nextMatch();
        this.viewMatches();
        this.viewMatchProfile();
        this.viewMatchChat();
        this.sendMatchMessage();
        this.unmatch();
        this.delete();
    }

    void addClient() {
        // Necessary for real-time updates to clients currently on Catphish
        server.sse("/sse", client -> {
            clients.add(client);
            client.onClose(() -> clients.remove(client));
        });
    }

    void signUp() {
        this.server.post("/users", ctx -> 
        {
            this.logger.info("Signing up");
            ObjectMapper mapper = new ObjectMapper();
            Account user = mapper.readValue(ctx.body(), Account.class);
            String username = user.getUsername();

            if (Database.accountExists(username)) {
                this.logger.error("Attempted to create an already existing account");
                ctx.result("An account with that username already exists");

            } else if (username.length() > Account.MAX_NAM_LEN) {
                this.logger.error("Username exceeds " + Account.MAX_NAM_LEN + " characters");
                ctx.result("Username exceeds " + Account.MAX_NAM_LEN + " characters");

            } else if (username.contains(" ")) {
                this.logger.error("Included spaces");
                ctx.result("Username must not include spaces");

            } else if (username.equals("")) {
                this.logger.error("Empty string");
                ctx.result("Username must not be empty");

            } else {
                String password = user.getPassword();

                Database.createAccount(username, password);
                this.logger.info(username + " created");
                ctx.result("Account created");
            }
        });
    }

    void signIn() {
        this.server.post("/users/{username}", ctx -> 
        {
            this.logger.info("Signing in");
            ObjectMapper mapper = new ObjectMapper();
            Account user = mapper.readValue(ctx.body(), Account.class);
            String username = user.getUsername();
            String password = user.getPassword();

            if (!Database.accountExists(username)) {
                this.logger.error("Account does not exist");
                ctx.result("No account with that username exists");

            } else if (!Database.validPassword(username, password)) {
                this.logger.error("Invalid password");
                ctx.result("Invalid password");

            } else {
                this.logger.info(username + " signed in");
                ctx.result("Signed in!");
            }
        });
    }

    void getProfile() {
        this.server.get("/users/{username}/profile", ctx -> 
        {
            this.logger.info("Viewing profile");
            Account user = Database.retrieveAccount(ctx.pathParam("username"));
            Account userJSON = new Account(); // The point of using another object is to prevent sending the extra account information retrieved from "retrieveAccount"

            userJSON.setBio(user.getBio());
            
            // Get the profile picture blob for the client since there's no stored profile picture on the client
            File file = new File(user.getPicturePath());
            byte[] fileContent = Files.readAllBytes(file.toPath());
            userJSON.setPictureBlob(Base64.getEncoder().encodeToString(fileContent));

            ctx.json(userJSON);
        });
    }

    void saveProfile() {
        this.server.put("/users/{username}/profile", ctx -> 
        {
            this.logger.info("Saving profile");
            ObjectMapper mapper = new ObjectMapper();
            Account user = mapper.readValue(ctx.body(), Account.class);
            String username = user.getUsername();
            String picture = user.getPictureBlob();

            // Saving a picture blob to the file system since it can't seem to be saved in the database
            // Saving a picture blob to the file system may actually be more practical
            // The reason "default.jpg" isn't saved under "resources/pictures" is just in case there's an account named "default"
            String base64Data = picture.split(",")[1];
            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
            ByteArrayInputStream bis = new ByteArrayInputStream(decodedBytes);
            BufferedImage image = ImageIO.read(bis);
            String picturePath = "app/src/main/resources/pictures/" + username + ".png"; // The folders must exist before saving the new file. Folders aren't also created when the file is created
            File pictureFile = new File(picturePath);
            ImageIO.write(image,"png", pictureFile);
            Database.setPicturePath(username, picturePath);

            String bio = user.getBio();
            Database.setBio(username, bio);
        });
    }

    void viewMatch() {
        this.server.get("/users/{username}/match", ctx -> 
        {
            this.logger.info("Matching");
            Account user = Database.retrieveAccount(ctx.pathParam("username"));
            Account candidate = Database.retrieveCandidate(user);
            Account candidateJSON = new Account();

            candidateJSON.setUsername(candidate.getUsername());
            candidateJSON.setBio(candidate.getBio());
            
            if (candidate.getUsername() != null) { // The username is checked since "retrieveAccount" never returns a null value
                File file = new File(candidate.getPicturePath());
                byte[] fileContent = Files.readAllBytes(file.toPath());
                candidateJSON.setPictureBlob(Base64.getEncoder().encodeToString(fileContent));
            }

            ctx.json(candidateJSON);
        });
    }

    void nextMatch() {
        this.server.post("/users/{username}/match", ctx -> 
        {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(ctx.body());
            JsonNode candidateNode = rootNode.path("candidate");
            JsonNode likedNode = rootNode.path("liked");
            String current = ctx.pathParam("username");
            String candidate = candidateNode.textValue();
            Account currentAcc = Database.retrieveAccount(current);
            Account candidateAcc = Database.retrieveAccount(candidate);
            String liked = likedNode.textValue();
            Boolean hasLiked = liked.equals("true");

            Database.check(current, candidate);

            if (hasLiked) {
                this.logger.info(current + " has liked " + candidate);
                Boolean matched = Database.like(currentAcc, candidateAcc);

                if (matched) {
                    this.logger.info(current + " has matched with " + candidate);
                    ctx.result("Matched");

                } else {
                    ctx.result("Pending");
                }

            } else {
                this.logger.info(current + " has rejected " + candidate);
                ctx.result("Rejected");
            }
        });
    }
    
    void viewMatches() {
        this.server.get("/users/{username}/matches", ctx -> 
        {
            this.logger.info("Viewing matches");
            Account user = Database.retrieveAccount(ctx.pathParam("username"));
            ArrayList<Account> matches = Database.retrieveMatches(user.getUsername());
            ArrayList<Account> matchesJSON = new ArrayList<Account>();

            for (Account match : matches) {
                Account matchJSON = new Account();
                matchJSON.setUsername(match.getUsername());
                matchJSON.setBio(match.getBio());

                File file = new File(match.getPicturePath());
                byte[] fileContent = Files.readAllBytes(file.toPath());
                matchJSON.setPictureBlob(Base64.getEncoder().encodeToString(fileContent));

                matchesJSON.add(matchJSON);
            }

            ctx.json(matchesJSON);
        });
    }

    void viewMatchProfile() {
        this.server.get("/users/{username}/matches/{matchname}", ctx -> 
        {
            this.logger.info("Viewing " + ctx.pathParam("matchname"));
            Account match = Database.retrieveAccount(ctx.pathParam("matchname"));
            Account matchJSON = new Account();

            matchJSON.setUsername(match.getUsername());
            matchJSON.setBio(match.getBio());

            File file = new File(match.getPicturePath());
            byte[] fileContent = Files.readAllBytes(file.toPath());
            matchJSON.setPictureBlob(Base64.getEncoder().encodeToString(fileContent));

            ctx.json(matchJSON);
        });
    }

    void viewMatchChat() {
        this.server.get("/users/{username}/matches/{matchname}/chat", ctx -> 
        {
            ctx.json(Database.retrieveChat(ctx.pathParam("username"), ctx.pathParam("matchname")).getMessages());
        });
    }

    void sendMatchMessage() {
        this.server.post("/users/{username}/matches/{matchname}/chat", ctx -> 
        {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(ctx.body());
            JsonNode messageNode = rootNode.path("message");
            Database.addMessage(ctx.pathParam("username"), ctx.pathParam("matchname"), messageNode.textValue());
            this.logger.info("Sent '" + messageNode.textValue() +"'");
            
            // If the match is currently a client on the chat page, send an event to load the chat on the match's end
            for (SseClient c: this.clients) {
                c.sendEvent(ctx.pathParam("username") + "messaged" + ctx.pathParam("matchname"), "NOT SIGNIFICANT");
            }
        });
    }

    void unmatch() {
        this.server.post("/users/{username}/matches/{matchname}/unmatch", ctx ->
        {
            Database.unmatch(ctx.pathParam("username"), ctx.pathParam("matchname"));

            // If the match is currently a client on the chat page or matches page, send an event to redirect the match to the matches page
            for (SseClient c: this.clients) {
                c.sendEvent(ctx.pathParam("username") + "unmatched" + ctx.pathParam("matchname"), "NOT SIGNIFICANT");
            }

            this.logger.info("Unmatched with" + ctx.pathParam("matchname"));
        });
    }

    void delete() {
        this.server.delete("/users/{username}", ctx -> 
        {
            Account user = Database.retrieveAccount(ctx.pathParam("username"));
            
            if (!user.getPicturePath().equals("app/src/main/resources/default.jpg")) {
                File file = new File(user.getPicturePath());
                file.delete();
            }

            ArrayList<Account> matches = Database.retrieveMatches(ctx.pathParam("username"));

            Database.removeAccount(user.getUsername());
            this.logger.info(ctx.pathParam("username") + " has been deleted");

            // If the match is currently a client on the chat page or matches pages, send an event to redirect the match to the matches page
            for (SseClient c: this.clients) {
                for (Account match : matches) {
                    c.sendEvent(ctx.pathParam("username") + "unmatched" + match.getUsername(), "NOT SIGNIFICANT");
                }
            }        
        });
    }
}