const fs = require("fs")
const express = require("express") //http
const app = express()
const db = require("./src/database")

app.use(express.json())

//? Database Creation
const defaultDatabaseSql = fs.readFileSync("./src/database/defaultDatabase.sql", "utf-8")
db.exec(defaultDatabaseSql)

//? Routes Definition
const RotasPessoa = require("./src/services/pessoa")
const RotasCategoria = require("./src/services/categoria")

app.use("/pessoa", RotasPessoa)
app.use("/categoria", RotasCategoria)



app.listen(3030,()=>{
  console.log("Servidor rodando na porta 3030!")
})
