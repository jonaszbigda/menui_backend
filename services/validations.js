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
    const decodedString = decodeURI(string);
    const valid = validator.isLength(decodedString, { max: 64 })
    if(!valid){
        throw newError("Niepoprawne zapytanie", 400)
    }
}

const validateRestaurantData = function(requestBody){
    const name = validator.isLength(requestBody.name, { max: 64 })
    const city = validator.isLength(requestBody.city, { max: 64 })
    const adress = validator.isLength(requestBody.adress, { max: 64 })
    const type = validator.isLength(requestBody.type, { max: 64 })
    let description = true;
    if(requestBody.description){
        description = validator.isLength(requestBody.description, { max: 400 })
    }
    if(!name || !city || !adress || !type || !description){
        throw newError("Dane nieprawidłowe", 400)
    }
}

const validateLunchSet = function(set){
    const name = validator.isLength(set.lunchSetName, { min: 2, max: 64 })
    if(!name){
        throw newError("Nieprawidłowe dane", 400)
    }
}

// EXPORTS

exports.validateLogin = validateLogin;
exports.validateRegister = validateRegister;
exports.validatePassword = validatePassword;
exports.validateSearch = validateSearch;
exports.validateRestaurantData = validateRestaurantData;
exports.validateLunchSet = validateLunchSet;