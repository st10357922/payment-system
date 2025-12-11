//"bcrypt.js - A library to help with password hashing" (BcryptJS, 2021). Available at: https://github.com/dcodeIO/bcrypt.js/
const bcrypt = require('bcryptjs'); //bcrypt.js for password hashing (BcryptJS, 2021). Available at: https://github.com/dcodeIO/bcrypt.js/

const passwords = [
  { username: 'emp001', password: 'SecurePass123!' }, //Sample employee password data
  { username: 'emp002', password: 'SecurePass456!' }  
];

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  for (const emp of passwords) {
    const salt = await bcrypt.genSalt(10); //Generate salt (BcryptJS, 2021). Available at: https://github.com/dcodeIO/bcrypt.js/
    const hash = await bcrypt.hash(emp.password, salt); 

    console.log(`Username: ${emp.username}`);
    console.log(`Password: ${emp.password}`);
    console.log(`Hash: ${hash}`);
    console.log(`\nSQL Insert:`); 
    console.log(`INSERT INTO employees (username, password, name, role) VALUES ('${emp.username}', '${hash}', 'Name Here', 'verifier');\n`);
    console.log('---'.repeat(30));
  }
}

generateHashes().catch(console.error); 
