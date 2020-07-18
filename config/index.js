import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT;
export const dbPass = process.env.DB_PASS;
export const cookiesSecret = process.env.COOKIES_SECRET;
export const jwtSecret = process.env.JWT_SECRET;
export const API_KEY = process.env.API_KEY;
