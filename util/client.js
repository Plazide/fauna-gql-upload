const faunadb = require("faunadb");
const fetch = require("node-fetch");
const secret = require("./secret");
require("dotenv").config();

const client = new faunadb.Client({
	secret,
	fetch
});

module.exports = client;