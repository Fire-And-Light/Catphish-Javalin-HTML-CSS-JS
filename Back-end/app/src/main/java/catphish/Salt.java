package catphish;

import java.math.BigInteger;
import java.security.SecureRandom;

class Salt {
    static String generate() {
        SecureRandom random = new SecureRandom();
        byte[] byteSalt = new byte[16];
        random.nextBytes(byteSalt);
        BigInteger num = new BigInteger(1, byteSalt);
        String stringSalt = num.toString(16);
        
        return stringSalt;
    }
}