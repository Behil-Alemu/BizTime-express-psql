process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");


let testInvoices;

beforeEach(async () => {
    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(`INSERT INTO
    companies (code,name,description) VALUES ('appley','Appley pie','Maker of OSX.') RETURNING code`);

     await db.query(`
      INSERT INTO
      invoices 
      (comp_code, amt, paid, add_date, paid_date) VALUES ('appley', 300, true, '2018-01-01', '2018-01-01')
      RETURNING id`);
  });

  describe("GET /invoices", () => {
    test("Get a list with invoices", async () => {
      const res = await request(app).get('/invoices')
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ invoices: testInvoices })
    })
  })
 



afterEach(async function(){
    await db.query(`DELETE FROM invoices`)
  })
  
afterAll(async function(){
    await db.end()
  })