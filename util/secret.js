const getConfig = require("./getConfig");
const config = getConfig();
require("dotenv").config({
  path: config.envPath
});


const { secretEnv } = config;
const secret = process.env[secretEnv];

module.exports = secret;