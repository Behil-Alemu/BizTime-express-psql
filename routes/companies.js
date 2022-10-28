const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require("slugify")

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT code,name FROM companies`);
        return res.json({ "companies": results.rows })
    }catch(err){
        return next(err)
    }

})

router.get('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const results = await db.query(`SELECT 
          c.code, 
          c.name, 
          c.description,
          i.id, 
          i.comp_code, 
          i.amt, 
          i.paid, 
          i.add_date, 
          i.paid_date FROM companies AS c
          JOIN  invoices AS i ON (c.code = i.comp_code)WHERE code = $1`, [code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find company with code of ${code}`, 404)
      }
      return res.send({ company: results.rows[0] })
    } catch (err) {
      return next(err)
    }
  })

router.post('/', async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const code = slugify(name, {lower: true})
      const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description]);
      return res.status(201).json({ company: results.rows[0] })
    } catch (err) {
      return next(err)
    }
  })


  router.put('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { name, description} = req.body;
      const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *', [ name, description, code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't update company with code of ${code}`, 404)
      }
      return res.json({ company: results.rows[0] })
    } catch (err) {
      return next(err)
    }
  })
  
  router.delete('/:code', async (req, res, next) => {
    try {
      const results = db.query('DELETE FROM companies WHERE code = $1 RETURNING code', [req.params.code])

    if (results.rows.length === 0) {
        throw new ExpressError(`There is no company with code of '${req.params.code}`, 404);
      }
      return res.json({ msg: "DELETED!" })
    } catch (e) {
      return next(e)
    }
  })



module.exports = router;