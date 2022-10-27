process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");


let testInvoices;

beforeEach(async function() {
    let result = await db.query(`
      INSERT INTO
      invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('apple', 300, true, '2018-01-01')
        RETURNING *`);
        testInvoices = result.rows[0];
  });

 



  afterEach(async function(){
    await db.query(`DELETE FROM users`)
  })
  
  afterAll(async function(){
    await db.end()
  })