//TODO: Encriptografar a senha no registro

const express = require('express');
const Joi = require('joi');
const router = express.Router();

const db = require("../../database")

const idSchema = Joi.object({
  id: Joi.number().required()
})
const pessoaSchema = Joi.object({
  nome: Joi.string().required(),
  usuario: Joi.string().required(),
  senha: Joi.string().required()
})

router.get('/', (req,res) => {
  const stmtPessoa = db.prepare("SELECT id, nome, usuario FROM pessoa")
  try{
    const rows = stmtPessoa.all()
    res.status(200).send(rows)

  }catch(e){
    res.status(500).send({"message": "Falha ao buscar pessoas!"})
  }
})
router.get('/:id', (req,res) => {
  const validationIdSchema = idSchema.validate(req.params)
  if(validationIdSchema.error){
    res.status(400).send(validationIdSchema.error.details)
    return
  }
  const sql = "SELECT id, nome, usuario FROM pessoa WHERE id = $id"
  
  const bind = {
    "id": req.params.id
  }

  const stmtPessoa = db.prepare(sql)
  try{
    const row = stmtPessoa.get(bind)
    res.status(200).send(row)
  }
  catch(e) {
    res.status(500).send({"message": `Falha ao buscar pessoa de id [${req.params.id}]!`})
  }
})
router.post('/', (req,res) => {
  const joiBodyValidation = pessoaSchema.validate(req.body,{ abortEarly: false })
  if(joiBodyValidation.error) {
    res.status(400).send(joiBodyValidation.error.details)
    return
  }
  const sql = `INSERT INTO pessoa VALUES (NULL, $nome, $usuario, $senha);`
  const bind = {
    "nome": req.body.nome,
    "usuario": req.body.usuario,
    "senha": req.body.senha
  }

  const stmtPessoa = db.prepare(sql)
  try{
    stmtPessoa.run(bind)
    res.status(200).send({"message": "Cadastrado com sucesso!"})
  } catch (e) {
    if(e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(400).send({"message": "Usuário já utilizado!"})
    } else {
      res.status(500).send({"message": "Falha ao cadastrar pessoa!"})
    }
  }
})
router.put('/:id', (req, res) => {
  const bodySchema = Joi.object({
    nome: Joi.string().min(1),
    usuario: Joi.string().min(1)
  }).min(1)

  const joiParamsValidation = idSchema.validate(req.params)
  if(joiParamsValidation.error){
    res.status(400).send(joiParamsValidation.error.details)
    return
  }

  const joiBodyValidation = bodySchema.validate(req.body)
  if(joiBodyValidation.error){
    res.status(400).send(joiBodyValidation.error.details)
    return
  }

  const sql = "UPDATE pessoa SET nome = $nome, usuario = $usuario WHERE id = $id"
  const bind = {
    "nome": req.body.nome,
    "usuario": req.body.usuario,
    "id": req.params.id
  }

  const stmtPessoa = db.prepare(sql)

  try{
    stmtPessoa.run(bind)
    res.status(200).send({"message": "Pessoa atualizada com sucesso!"})
  } catch (e) {
    if(e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(400).send({"message": `Usuário '${req.body.usuario}' já em uso!`})
    } else {
      res.status(500).send({"message": "Não foi possível atualizar a pessoa!"})
    }

  }
})
router.patch('/:id', (req, res) => {
  const bodySchema = Joi.object({
    nome: Joi.string().min(1),
    usuario: Joi.string().min(1)
  }).min(1)

  const validationIdSchema = idSchema.validate(req.params)
  if(validationIdSchema.error){
    res.status(400).send(validationIdSchema.error.details)
    return
  }
  const validationBodySchema = bodySchema.validate(req.body)
  if(validationBodySchema.error){
    res.status(400).send(validationBodySchema.error.details)
    return
  }

  let sql = "UPDATE pessoa"
  let bind = {
    "id": req.params.id
  }
  Object.keys(req.body).forEach((e, index) => {
    sql += (index === 0) ? ` SET ${e} = $${e},` : ` ${e} = $${e},`

    bind[`${e}`] = req.body[e]
  })
  //? Remoção da última vírgula
  sql = sql.substring(0, sql.length - 1)

  sql += " WHERE id = $id"

  const stmtPessoa = db.prepare(sql)

  try{
    stmtPessoa.run(bind)
    res.status(200).send({"message": "Usuário atualizado com sucesso!"})
  } catch (e) {
    if(e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(400).send({"message": `Usuário '${req.body.usuario}' já em uso!`})
    } else {
      res.status(500).send({"message": "Não foi possível atualizar o usuário!"})
    }
  }
})
router.delete('/:id', (req, res) => {
  const validationIdSchema = idSchema.validate(req.params)
  if(validationIdSchema.error){
    res.status(400).send(validationIdSchema.error.details)
    return
  }
  const sql = "DELETE FROM pessoa WHERE id = $id"
  const bind = {
    "id": req.params.id
  }

  const stmtPessoa = db.prepare(sql)

  try{
    stmtPessoa.run(bind)
    res.status(200).send({"message": `Pessoa de id [${req.params.id}] removida com sucesso!`})
  } catch (e) {
    res.status(500).send({"message": `Falha ao deletar pessoa de id [${req.params.id}]!`})
  }
})


module.exports = router;