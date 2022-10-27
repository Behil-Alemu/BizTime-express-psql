
const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")

router.get("/", async function(req, res, next) {
  try {
    const results = await db.query("SELECT * FROM invoices")
    return res.json({ invoices: results.rows});
  } catch(err){
    return next(err)
  }
});



router.get("/:id", async function(req, res, next) {
  try {
    const resp = await db.query(
      `SELECT i.id, 
      i.comp_code, 
      i.amt, 
      i.paid, 
      i.add_date, 
      i.paid_date, 
      c.name, 
      c.description 
        FROM invoices AS i
        INNER JOIN companies AS c ON (i.comp_code = c.code)  
        WHERE id = $1`, [req.params.id]);

    if (resp.rows.length === 0) {
      let notFoundError = new Error(`There is no invoice with id '${req.params.id}`);
      notFoundError.status = 404;
      throw notFoundError;
    }
    return res.json({ invoice: resp.rows[0] });
  } catch (err) {
    return next(err);
  }
});




router.post("/", async function(req, res, next) {
  try {
    const { comp_code, amt, paid, add_date, paid_date } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
      [comp_code, amt, paid, add_date, paid_date]);

    return res.status(201).json({invoice: result.rows[0]});  // 201 CREATED
  } catch (err) {
    return next(err);
  }
});



router.put("/:id", async function(req, res, next) {
  try {
    if ("id" in req.body) {
      throw new ExpressError("Don't add id with JSON", 400)
    }
    const { comp_code, amt, paid, add_date, paid_date } = req.body;
    const { id } = req.params;
    const result = await db.query(
      `UPDATE invoices 
           SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5
           WHERE id = $6
           RETURNING *`,
      [comp_code, amt, paid, add_date, paid_date, id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no invoice with id of '${req.params.id}`, 404);
    }

    return res.json({ invoice: result.rows[0]});
  } catch (err) {
    return next(err);
  }
});




router.delete("/:id", async function(req, res, next) {
  try {
    const result = await db.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no invoice with id of '${req.params.id}`, 404);
    }
    return res.json({ message: "Deleted invoice" });
  } catch (err) {
    return next(err);
  }
});




module.exports = router;