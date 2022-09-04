//Todo: Desenvolver endpoint de registro
const express = require('express');
const Joi = require('joi');
const router = express.Router();

const db = require("../../database")

const idSchema = Joi.object({
  id: Joi.number().required()
})
const registroSchema = Joi.object({
  titulo: Joi.string().required(),
  descricao: Joi.string(),
  tipo: Joi.number().min(0).max(1).required(),
  valor: Joi.number().required(),
  data_registro: Joi.date().required(),
  id_pessoa: Joi.number().required(),
  id_categoria: Joi.number().required()
})

router.get('/', (req,res) => {
  const stmtRegistro = db.prepare("SELECT * FROM registro")
  try{
    const rows = stmtRegistro.all()
    res.status(200).send(rows)

  } catch (e) {
    console.log(e)
    res.status(500).send({"message": "Falha ao buscar os registros!"})
  }
})
router.get('/:id', (req,res) => {
  const validationIdSchema = idSchema.validate(req.params)
  if(validationIdSchema.error){
    res.status(400).send(validationIdSchema.error.details)
    return
  }
  const stmtRegistro = db.prepare("SELECT * FROM registro WHERE id = $id")
  try{
    const rows = stmtRegistro.all({"id": req.params.id})
    res.status(200).send(rows)

  } catch (e) {
    console.log(e)
    res.status(500).send({"message": "Falha ao buscar os registros!"})
  }
})
router.post('/', (req,res) => {
  const joiBodyValidation = registroSchema.validate(req.body,{ abortEarly: false })
  if(joiBodyValidation.error) {
    res.status(400).send(joiBodyValidation.error.details)
    return
  }
  req.body.descricao = req.body.descricao || ""
  
  const sql = `INSERT INTO registro VALUES (
    NULL, 
    $titulo,
    $descricao,
    $tipo,
    $valor,
    $id_pessoa,
    $id_categoria,
    $data_registro
  );`
  const bind = {
    "titulo": req.body.titulo,
    "descricao": req.body.descricao,
    "tipo": req.body.tipo,
    "valor": req.body.valor,
    "id_pessoa": req.body.id_pessoa,
    "id_categoria": req.body.id_categoria,
    "data_registro": req.body.data_registro
  }

  const sqlPessoa = "SELECT id FROM pessoa WHERE id = $id"
  const sqlCategoria = "SELECT id FROM categoria WHERE id = $id"

  const stmtIdPessoa = db.prepare(sqlPessoa)
  const resultIdPessoa = stmtIdPessoa.get({"id": req.body.id_pessoa})
  if(!resultIdPessoa) {
    res.status(400).send({"message": "O id_pessoa informado não está cadastrado!"})
    return
  }

  const stmtIdCategoria = db.prepare(sqlCategoria)
  const resultIdCategoria = stmtIdCategoria.get({"id": req.body.id_categoria})
  if(!resultIdCategoria) {
    res.status(400).send({"message": "O id_categoria informado não está cadastrado!"})
    return
  }

  const stmtRegistro = db.prepare(sql)
  try{
    resultRegistro = stmtRegistro.run(bind)
    res.status(200).send({"message": "Registro cadastrado com sucesso!"})
  } catch (e){
    res.status(500).send({"message": "Não foi possível cadastrar o registro!"})
    console.log(e)
  }

})
router.put('/:id', (req, res) => {
  const joiParamsValidation = idSchema.validate(req.params)
  if(joiParamsValidation.error){
    res.status(400).send(joiParamsValidation.error.details)
    return
  }

  const joiBodyValidation = registroSchema.validate(req.body)
  if(joiBodyValidation.error){
    res.status(400).send(joiBodyValidation.error.details)
    return
  }

  const sql = `
  UPDATE registro
    SET titulo = $titulo,
        descricao = $descricao,
        tipo = $tipo,
        valor = $valor,
        id_pessoa = $id_pessoa,
        id_categoria = $id_categoria,
        data_registro = $data_registro
  WHERE id = $id`
  const bind = {
    "titulo": req.body.titulo,
    "descricao": req.body.descricao || "",
    "tipo": req.body.tipo,
    "valor": req.body.valor,
    "id_pessoa": req.body.id_pessoa,
    "id_categoria": req.body.id_categoria,
    "data_registro": req.body.data_registro,
    "id": req.params.id
  }

  const sqlPessoa = "SELECT id FROM pessoa WHERE id = $id"
  const sqlCategoria = "SELECT id FROM categoria WHERE id = $id"

  const stmtIdPessoa = db.prepare(sqlPessoa)
  const resultIdPessoa = stmtIdPessoa.get({"id": req.body.id_pessoa})
  if(!resultIdPessoa) {
    res.status(400).send({"message": "O id_pessoa informado não está cadastrado!"})
    return
  }

  const stmtIdCategoria = db.prepare(sqlCategoria)
  const resultIdCategoria = stmtIdCategoria.get({"id": req.body.id_categoria})
  if(!resultIdCategoria) {
    res.status(400).send({"message": "O id_categoria informado não está cadastrado!"})
    return
  }

  const stmtRegistro = db.prepare(sql)
  try {
    stmtRegistro.run(bind)
    res.status(200).send({"message": "Registro atualizado com sucesso!"})
  } catch(e) {
    res.status(500).send({"message": "Não foi possível atualizar o registro!"})
  }
})
router.patch('/:id', (req, res) => {
  res.status(501).send()
})
router.delete('/:id', (req, res) => {
  //todo: 1. Verificar se o id informado existe antes de executar a exclusão
  const validationIdSchema = idSchema.validate(req.params)
  if(validationIdSchema.error){
    res.status(400).send(validationIdSchema.error.details)
    return
  }
  const stmtRegistro = db.prepare("DELETE FROM registro WHERE id = $id")
  try{
    stmtRegistro.run({"id": req.params.id})
    res.status(200).send({"message": "Registro removido com suecsso!"})

  } catch (e) {
    console.log(e)
    res.status(500).send({"message": "Falha ao remover o registro!"})
  }
})


module.exports = router;