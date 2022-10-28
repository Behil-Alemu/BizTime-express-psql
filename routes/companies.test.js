process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");


let testCompanies;

beforeEach(async function() {
    let result = await db.query(`
      INSERT INTO
      companies (code,name,description) VALUES ('apple','Apple pie','Maker of OSX.') RETURNING code`);
        testCompanies = result.rows[0];
  });

  describe("GET /", function () {

    test("It should respond with array of companies", async function () {
      const response = await request(app).get("/companies");
      expect(response.body).toEqual({
        "companies": [
          {code: "apple", name: "Apple pie"}
        ]
      });
    })
  
  });


  describe("GET /:code", function () {

    test("It return company info", async function () {
      const response = await request(app).get("/companies/apple")
      
    });
  
    test("It should return 404 for no-such-company", async function () {
      const response = await request(app).get("/companies/pie");
      expect(response.status).toEqual(404);
    })
  });

  describe("POST /", function () {

    test("It should add company", async function () {
      const response = await request(app)
          .post("/companies")
          .send({name: "Soup", description: "kitchen"});
  
      expect(response.body).toEqual(
          {
            company: {
              code: "soup",
              name: "Soup",
              description: "kitchen",
            }
          }
      );
    });
  
    test("Can not have the same name", async function () {
      const response = await request(app)
          .post("/companies")
          .send({name: "Apple", description: "already taken"});
  
      expect(response.status).toEqual(500);
    })
  });

  describe("PUT /", function () {

    test("It should update company", async function () {
      const response = await request(app)
          .put("/companies/apple")
          .send({name: "Newapple", description: "new iphone"});
  
      expect(response.body).toEqual(
          {
            company: {
              code: "apple",
              name: "Newapple",
              description: "new iphone",
            }
          }
      );
    });
  
    test("Can not find company code", async function () {
      const response = await request(app)
          .put("/companies/noname")
          .send({"Any value":'value'});
  
      expect(response.status).toEqual(404);
    })
  });

  describe("DELETE /", function () {

    test("delete company", async function () {
      const response = await request(app)
          .delete("/companies/apple");
  
      expect(response.body).toEqual({ msg: "DELETED!" });
    });
  
    test(" 404 if company not found", async function () {
      const response = await request(app)
          .delete("/companies/pie");
  
      expect(response.status).toEqual(404);
    });
  });
 

  afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM companies");
  });
  
  afterAll(async function(){
    await db.end()
  })