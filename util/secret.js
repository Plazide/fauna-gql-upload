const getConfig = require("./getConfig");
const config = getConfig();
require("dotenv").config({
  path: config.envPath || '.env'
});

const defaultSecret = "FAUNADB_SECRET";
const { secretEnv = defaultSecret } = config;
const secret = process.env[secretEnv];

module.exports = secret;