const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if(err){
    console.log("Não foi possível criar o banco!", err)
    return;
  }
})

module.exports = db;

