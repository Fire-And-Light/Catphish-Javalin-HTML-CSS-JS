package catphish;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

class DatabaseConnector {
    private static Connection conn;

    static Connection getConnection() {
        if (DatabaseConnector.conn == null) {
            try {
                String URL = "jdbc:h2:mem:db";
                String username = System.getenv("DEMO_USERNAME");
                String password = System.getenv("DEMO_PASSWORD");
                DatabaseConnector.conn = DriverManager.getConnection(URL, username, password);
                
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        return DatabaseConnector.conn;
    }
}