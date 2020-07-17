import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT;
export const dbPass = process.env.DB_PASS;
