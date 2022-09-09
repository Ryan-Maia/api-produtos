const fs = require("fs")
const express = require("express") //http
const app = express()
const db = require("./src/database")

app.use(express.json())

//? Database Creation
const defaultDatabaseSql = fs.readFileSync("./src/database/defaultDatabase.sql", "utf-8")
db.pragma('foreign_keys = ON;');
db.exec(defaultDatabaseSql)

//? Routes Definition
const RotasPessoa = require("./src/services/pessoa")
const RotasCategoria = require("./src/services/categoria")
const RotasRegistro = require("./src/services/registro")

app.use("/pessoa", RotasPessoa)
app.use("/categoria", RotasCategoria)
app.use("/registro", RotasRegistro)

const PORT = process.env.PORT || 3030;

app.listen(PORT, ()=>{
  console.log("Servidor rodando na porta 3030!")
})
