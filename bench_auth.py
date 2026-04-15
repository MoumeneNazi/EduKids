import bcrypt
import time

password = "password123".encode('utf-8')
salt = bcrypt.gensalt(rounds=12)
hashed = bcrypt.hashpw(password, salt)

start = time.time()
for _ in range(5):
    bcrypt.checkpw(password, hashed)
end = time.time()

print(f"Average time per checkpw: {(end - start) / 5:.4f} seconds")
