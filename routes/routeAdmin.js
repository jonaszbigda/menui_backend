const express = require("express");
const jwt = require('jsonwebtoken')
const { appkey } = require("../config")
const { fetchAllAdminData } = require("../services/databaseServices.js");
const {
    newError,
    handleError
  } = require("../services/services.js");

var router = express.Router();

router.post("/getall", async (req, res) => {
    try {
        const verified = jwt.verify(req.body.token, appkey, {ignoreExpiration: false})
        if(!verified){
            throw newError("Brak dostępu", 403)
        }
        const results = await fetchAllAdminData();
        const encrypted = jwt.sign(results, appkey, {expiresIn: "30m"})
        res.send(encrypted) 
    } catch (error) {
        handleError(error, res)
    }
})

module.exports = router;