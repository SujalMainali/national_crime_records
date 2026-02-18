import bcrypt from 'bcrypt';

const password = 'admin123';
const hash = '$2a$10$rKqF7LqVqR6p.rQ5xQxZ6uGJYvYVZ4f8YkWX9YfXqXqXqXqXqXqXq';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error comparing password:', err);
  } else if (result) {
    console.log('Password matches the hash.');
  } else {
    console.log('Password does NOT match the hash.');
  }
});