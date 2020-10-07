const dotenv = require("dotenv");
dotenv.config();

exports.port = process.env.PORT;
exports.dbPass = process.env.DB_PASS;
exports.dbUser = process.env.DB_USER;
exports.dbHost = process.env.DB_HOST;
exports.dbPort = process.env.DB_PORT;
exports.dbName = process.env.DB_NAME;
exports.cookiesSecret = process.env.COOKIES_SECRET;
exports.jwtSecret = process.env.JWT_SECRET;
exports.CRM_KEY = process.env.CRM_KEY;
exports.CRM_USER = process.env.CRM_USER;
exports.CRM_EMAIL = process.env.CRM_EMAIL;
exports.MAIL_PASS = process.env.MAIL_PASS;
