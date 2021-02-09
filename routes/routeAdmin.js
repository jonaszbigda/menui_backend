const express = require("express");
const { appkey } = require("../config")
const { fetchAllAdminData } = require("../services/databaseServices.js");
const {
    newError,
    handleError,
    encryptRSA
  } = require("../services/services.js");

var router = express.Router();

router.post("/getall", async (req, res) => {
    try {
        if(req.body.key === appkey){
            const results = await fetchAllAdminData();
            const encrypted = encryptRSA(results)
            res.send(encrypted) 
        } else {
            throw newError("Brak dostępu", 403)
        }
    } catch (error) {
        handleError(error, res)
    }
})

module.exports = router;