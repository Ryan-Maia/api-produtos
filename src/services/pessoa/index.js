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
  db.all("SELECT id, nome, usuario FROM pessoa", function (err, rows) {
    if(err) {
      res.status(500).send({"message": "Falha ao buscar pessoas!"})
      return
    }
    res.status(200).send(rows)
  })
})
router.get('/:id', (req,res) => {
  const validationIdSchema = idSchema.validate(req.params)
  if(validationIdSchema.error){
    res.status(400).send(validationIdSchema.error.details)
    return
  }
  const sql = "SELECT id, nome, usuario FROM pessoa WHERE id = $id"
  const bind = {
    "$id": req.params.id
  }
  db.get(sql,bind, function (err, row) {
    if(err) {
      res.status(500).send({"message": `Falha ao buscar pessoa de id [${req.params.id}]!`})
      return
    }
    if(!row) res.status(200).send([])
    res.status(200).send(row)
  })
})
router.post('/', (req,res) => {
  const joiBodyValidation = pessoaSchema.validate(req.body,{ abortEarly: false })
  if(joiBodyValidation.error) {
    res.status(400).send(joiBodyValidation.error.details)
    return
  }
  //? Criação da query
  const sql = `INSERT INTO pessoa (nome,usuario,senha) VALUES ($nome, $usuario, $senha);`
  //? Definição dos binds da query (para evitar sql injection)
  const bind = {
    "$nome": req.body.nome,
    "$usuario": req.body.usuario,
    "$senha": req.body.senha
  }
  //? Execução da query
  db.run(sql, bind, (err)=>{
    //? Tratamento de erros
    if(err){
      if(err.errno == 19){
        res.status(400).send({"message": "Usuário já utilizado!"})
      } else {
        res.status(500).send({"message": "Falha ao cadastrar pessoa!"})
      }
    } else { //?Retorno de sucesso
      res.status(200).send({"message": "Cadastrado com sucesso!"})
    }
  })
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
    "$nome": req.body.nome,
    "$usuario": req.body.usuario,
    "$id": req.params.id
  }

  db.run(sql, bind , function (err, row) {
    console.log('🚀 ~ file: index.js ~ line 86 ~ err', err, row);
    if(err) {
      if(err.errno == 19) {
        res.status(400).send({"message": `Usuário '${req.body.usuario}' já em uso!`})
      }else{
        res.status(500).send({"message": "Não foi possível atualizar o usuário!"})
      }
    } else {
      res.status(200).send({"message": "Usuário atualizado com sucesso!"})
    }
  })
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
    "$id": req.params.id
  }
  Object.keys(req.body).forEach((e) => {
    sql += ` SET ${e} = $${e},`
    bind[`$${e}`] = req.body[e]
  })

  sql = sql.substring(0, sql.length - 1)

  sql += " WHERE id = $id"

  db.run(sql, bind , function (err) {
    if(err) {
      if(err.errno == 19) {
        res.status(400).send({"message": `Usuário '${req.body.usuario}' já em uso!`})
      }else{
        res.status(500).send({"message": "Não foi possível atualizar o usuário!"})
      }
    } else {
      res.status(200).send({"message": "Usuário atualizado com sucesso!"})
    }
  })

})
router.delete('/:id', (req, res) => {
  const validationIdSchema = idSchema.validate(req.params)
  if(validationIdSchema.error){
    res.status(400).send(validationIdSchema.error.details)
    return
  }
  const sql = "DELETE FROM pessoa WHERE id = $id"
  const bind = {
    "$id": req.params.id
  }
  //Todo: Implementar verificação se o usuáraio de id x existe antes de
  db.run(sql,bind, function (err, row) {
    if(err) {
      res.status(500).send({"message": `Falha ao deletar pessoa de id [${req.params.id}]!`})
      return
    }
    res.status(200).send({"message": `Pessoa de id [${req.params.id}] removida com sucesso!`})
  })
})


module.exports = router;