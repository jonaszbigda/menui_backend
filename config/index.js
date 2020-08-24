import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT;
export const dbPass = process.env.DB_PASS;
export const cookiesSecret = process.env.COOKIES_SECRET;
export const jwtSecret = process.env.JWT_SECRET;
export const CRM_KEY = process.env.CRM_KEY;
export const CRM_USER = process.env.CRM_USER;
export const CRM_EMAIL = process.env.CRM_EMAIL;
