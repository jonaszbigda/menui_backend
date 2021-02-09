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
exports.MAIL_PASS = process.env.MAIL_PASS;
exports.s3_key = process.env.S3_KEY;
exports.s3_secret = process.env.S3_SECRET;
exports.appkey = process.env.APP_KEY
exports.publicKey = process.env.PUBLIC_KEY