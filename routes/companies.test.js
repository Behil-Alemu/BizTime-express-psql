process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");


let testCompanies;

beforeEach(async function() {
    let companies = await db.query(`
      INSERT INTO
        cats (name) VALUES ('TestCat')
        RETURNING id, name`);
    testCat = result.rows[0];
  });