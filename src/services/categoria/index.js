const express = require('express');
const Joi = require('joi');
const router = express.Router();

const db = require("../../database")

const categoriaSchema = Joi.object({
  titulo: Joi.string().required()
})
const idSchema = Joi.object({
  id: Joi.number().required()
})

router.get('/', (req,res) => {
  const stmtCategoria = db.prepare("SELECT id, titulo FROM categoria")
  try{
    const rows = stmtCategoria.all()
    res.status(200).send(rows)
  } catch (e) {
    res.status(500).send({"message": "Falha ao buscar categorias!"})
  }
})
router.get('/:id', (req,res) => {
  const joiParamsValidation = idSchema.validate(req.params)
  if(joiParamsValidation.error){
    res.status(400).send(joiParamsValidation.error.details)
    return
  }
  const sql = "SELECT titulo FROM categoria WHERE id = $id"
  const bind = {
    "id": req.params.id
  }

  const stmtCategoria = db.prepare(sql)

  try{
    const row = stmtCategoria.get(bind)
    res.status(200).send(row)
  } catch (e) {
    res.status(500).send({"message": `Falha ao buscar categoria de id [${req.params.id}]!`})
  }
})
router.post('/', (req,res) => {
  const joiValidation = categoriaSchema.validate(req.body)
  if(joiValidation.error) {
    res.status(400).send(joiValidation.error.details)
    return
  }
  const sql = `INSERT INTO categoria (titulo) VALUES ($titulo);`
  const bind = {
    "titulo": req.body.titulo.toLowerCase()
  }

  const stmtCategoria = db.prepare(sql)
  try {
    stmtCategoria.run(bind)
    res.status(200).send({"message": "Categoria cadastrada com sucesso!"})
  }
  catch (e) {
    if(e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(400).send({"message": "Categoria já cadastrada!"})
    } else {
      res.status(500).send({"message": "Falha ao cadastrar categoria!"})
    }
  }
})
router.put('/:id', (req, res) => {
  const joiParamsValidation = idSchema.validate(req.params)
  if(joiParamsValidation.error){
    res.status(400).send(joiParamsValidation.error.details)
    return
  }

  const joiBodyValidation = categoriaSchema.validate(req.body)
  if(joiBodyValidation.error){
    res.status(400).send(joiBodyValidation.error.details)
    return
  }

  const sql = "UPDATE categoria SET titulo = $titulo WHERE id = $id"
  const bind = {
    "titulo": req.body.titulo.toLowerCase(),
    "id": req.params.id
  }

  const stmtCategoria = db.prepare(sql)
  try {
    stmtCategoria.run(bind)
    res.status(200).send({"message": "Categoria atualizada com sucesso!"})
  }
  catch (e) {
    if(e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(400).send({"message": "Categoria já em uso!"})
    } else {
      res.status(500).send({"message": "Falha ao atualizada categoria!"})
    }
  }
})
router.delete('/:id', (req, res) => {
  //todo: 1. Verificar se o id informado existe antes de executar a exclusão 2. Informar caso a categoria em questão esteja em uso por algum registro
  const joiParamsValidation = idSchema.validate(req.params)
  if(joiParamsValidation.error){
    res.status(400).send(joiParamsValidation.error.details)
    return
  }
  const sql = "DELETE FROM categoria WHERE id = $id"
  const bind = {
    "id": req.params.id
  }
  const stmtCategoria = db.prepare(sql)

  try{
    stmtCategoria.run(bind)
    res.status(200).send({"message": `Categoria de id [${req.params.id}] removida com sucesso!`})
  } catch (e) {
    res.status(500).send({"message": `Falha ao deletar categoria de id [${req.params.id}]!`})
  }
})


module.exports = router;