const validator = require('validator');

function validatePassword(inputPassword) {
    if (validator.isStrongPassword(inputPassword, { minLength: 6 })) {
        return inputPassword;
    } else {
        throw new Error('Password should be strong and minimum length should be 6');
    }
};

function validateProfile(req) {
    const profile = req.body;
    const expectedProfileFields = ['firstname', 'lastname', 'age', 'gender', 'photoURL', 'skills'];
    const randomFields = [];

    const isValidFields = Object.keys(profile).every((field) => {
        const isValid = expectedProfileFields.includes(field);
        if (!isValid) {
            randomFields.push(field);
        }
        return isValid;
    });
    if (randomFields.length > 0) {
        throw new Error(`***${randomFields.join(', ')}*** is not acceptable fields`);
    }
    return isValidFields;
}

module.exports = {
    validatePassword,
    validateProfile
}