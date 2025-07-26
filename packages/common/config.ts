import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    db: {
        url: process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/medilink',
    },
    jwt: {
        secret: process.env.JWT_SECRET || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvRWJwsim/No1GUGjMNC2
2OKvPk3YfibuBl6RIWaBkTwMuJ5aB6hrKBdjdS8Uzf5StOLZO3gO6Suq/mEQuUBd
v35NmlmwN3TtfBkrp36W3Skk9Y/7TPQWHZ/t75NXxFl+ZEWL0idsn+I55UhgitJH
ioysnBppKEmtNexrK0keC95JgZA+nAjVjloNUL3JcwL9shbyi+qhe0hfGcSP8eg9
7Esy9PA9e0cgMde1wqaprgvR/R23mPwXQbJc6YnAcSEGDIIGpkW5cf6V3H0e1p4A
UtvTAOYAIK+1KtYj5+xjGvhHtSR8ZLK3zHomzbl3LgcKTPqcH/Ds7F9IfJs4ZfkY
OQIDAQAB
-----END PUBLIC KEY-----
`,
    },
}