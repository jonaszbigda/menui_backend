const validator = require('validator');
const { newError } = require("./services.js");

const validateLogin = function(requestBody){
    const email = validator.isEmail(requestBody.email) && validator.isLength(requestBody.email, { max: 64 })
    const password = validator.isLength(requestBody.password, { max: 64 });
    if(!email || !password){
        throw newError("Dane logowania nieprawidłowe :/", 400);
    }
}

const validatePassword = function(pass){
    const password = validator.isLength(pass, { min: 2, max: 64 });
}

const validateRegister = function(requestBody){
    if(requestBody.isRestaurant){
        const email = validator.isEmail(requestBody.email) && validator.isLength(requestBody.email, { max: 64 })
        const password = validator.isLength(requestBody.password, { min:6, max:64 });
        const firstname = validator.isLength(requestBody.firstname, { min:1, max:24 });
        const lastname = validator.isLength(requestBody.lastname, { min:1, max:24 });
        const NIP = validator.isLength(requestBody.NIP, { min:10, max:20 });
        const adress = validator.isLength(requestBody.adress, { min:2, max:64 });
        const companyName = validator.isLength(requestBody.companyName, { min:2, max:64 });
        if(!email || !password || !firstname || !lastname || !NIP || !adress || !companyName) {
            throw newError("Dane nieprawidłowe", 400)
        }
    } else {
        const email = validator.isEmail(requestBody.email) && validator.isLength(requestBody.email, { max: 64 })
        const password = validator.isLength(requestBody.password, { min:6, max:64 });
        const login = validator.isLength(requestBody.login, { min:2, max:64 });
        if(!email || !password || !login) {
            throw newError("Dane nieprawidłowe", 400)
        }
    }
}

const validateSearch = function(string){
    const valid = validator.isLength(string, { max: 64 }) && validator.isAlphanumeric(string)
    if(!valid){
        throw newError("Niepoprawne zapytanie", 400)
    }
}

// EXPORTS

exports.validateLogin = validateLogin;
exports.validateRegister = validateRegister;
exports.validatePassword = validatePassword;
exports.validateSearch = validateSearch;