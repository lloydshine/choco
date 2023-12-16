const fs = require("fs");

function generateCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let i = 0; i < 3; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)];
  }

  const data = { code: code };

  try {
    fs.writeFileSync("config/codes.json", JSON.stringify(data, null, 4), {
      encoding: "utf8",
      flag: "w", // Use 'w' flag to open the file for writing
    });
    console.log("Code saved to codes.json");
  } catch (err) {
    console.error("Error saving code:", err.message);
  }
}

function getCode() {
  const data = fs.readFileSync("config/codes.json");
  const codeObj = JSON.parse(data);
  return codeObj.code;
}

module.exports = {
  generateCode,
  getCode,
};
