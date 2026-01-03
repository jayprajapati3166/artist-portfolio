const bcrypt = require("bcrypt");

async function hashPassword() {
  const plainPassword = "TEMP_PASSWORD"; // change this if you want
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log(hash);
}

hashPassword();
