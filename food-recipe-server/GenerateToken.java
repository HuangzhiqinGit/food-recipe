import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public class GenerateToken {
    public static void main(String[] args) {
        String secret = "your_jwt_secret_key_here_make_it_long_and_secure";
        Long expiration = 86400000L; // 24小时
        Long userId = 1L;
        
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        String token = Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
        
        System.out.println(token);
    }
}
