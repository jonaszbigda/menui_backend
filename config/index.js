import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT;
export const dbPass = process.env.DB_PASS;
export const dbUser = process.env.DB_USER;
export const dbHost = process.env.DB_HOST;
export const dbPort = process.env.DB_PORT;
export const dbName = process.env.DB_NAME;
export const cookiesSecret = process.env.COOKIES_SECRET;
export const jwtSecret = process.env.JWT_SECRET;
export const CRM_KEY = process.env.CRM_KEY;
export const CRM_USER = process.env.CRM_USER;
export const CRM_EMAIL = process.env.CRM_EMAIL;
export const MAIL_PASS = process.env.MAIL_PASS;
