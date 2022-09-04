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
  db.all("SELECT id, titulo FROM categoria", function (err, rows) {
    if(err) {
      res.status(500).send({"message": "Falha ao buscar categorias!"})
      return
    }
    res.status(200).send(rows)
  })
})
router.get('/:id', (req,res) => {
  const joiParamsValidation = idSchema.validate(req.params)
  if(joiParamsValidation.error){
    res.status(400).send(joiParamsValidation.error.details)
    return
  }
  const sql = "SELECT titulo FROM categoria WHERE id = $id"
  const bind = {
    "$id": req.params.id
  }
  db.get(sql,bind, function (err, row) {
    if(err) {
      res.status(500).send({"message": `Falha ao buscar categoria de id [${req.params.id}]!`})
      return
    }
    if(!row) res.status(200).send([])
    res.status(200).send(row)
  })
})
router.post('/', (req,res) => {
  const joiValidation = categoriaSchema.validate(req.body)
  if(joiValidation.error) {
    res.status(400).send(joiValidation.error.details)
    return
  }
  //? Criação da query
  const sql = `INSERT INTO categoria (titulo) VALUES ($titulo);`
  //? Definição dos binds da query (para evitar sql injection)
  const bind = {
    "$titulo": req.body.titulo.toLowerCase()
  }
  //? Execução da query
  db.run(sql, bind, (err)=>{
    //? Tratamento de erros
    if(err){
      if(err.errno == 19){
        res.status(400).send({"message": "Categoria já cadastrada!"})
      } else {
        res.status(500).send({"message": "Falha ao cadastrar categoria!"})
      }
    } else { //?Retorno de sucesso
      res.status(200).send({"message": "Categoria cadastrada com sucesso!"})
    }
  })
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
    "$titulo": req.body.titulo.toLowerCase(),
    "$id": req.params.id
  }

  db.run(sql, bind , function (err, row) {
    if(err) {
      if(err.errno == 19) {
        res.status(400).send({"message": `Categoria '${req.body.titulo}' já em uso!`})
      }else{
        res.status(500).send({"message": "Não foi possível atualizar a categoria!"})
      }
    } else {
      res.status(200).send({"message": "Categoria atualizada com sucesso!"})
    }
  })
})
router.delete('/:id', (req, res) => {
  const joiParamsValidation = idSchema.validate(req.params)
  if(joiParamsValidation.error){
    res.status(400).send(joiParamsValidation.error.details)
    return
  }
  const sql = "DELETE FROM categoria WHERE id = $id"
  const bind = {
    "$id": req.params.id
  }
  //Todo: Implementar verificação se o usuáraio de id x existe antes de
  db.run(sql,bind, function (err, row) {
    if(err) {
      res.status(500).send({"message": `Falha ao deletar categoria de id [${req.params.id}]!`})
      return
    }
    res.status(200).send({"message": `Categoria de id [${req.params.id}] removida com sucesso!`})
  })
})


module.exports = router;