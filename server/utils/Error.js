 const handleErrors = (err) => {
    // console.log('err', err);
    // console.log('errmessage', err.message);
    let errors = {
        name: "",
        password: "",
        email: ""

    }

    //required paths error
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log('properties.path', properties.path);
            // console.log('properties.message', properties.message);
            errors[properties.path] = properties.message
        })
        return errors
    } else if (err.code === 11000) {
        //unique paths error
        errors.email = "Email already exist"
        return errors

    }
    //  else if (err.message === " user email does not exist") {
    //     errors.email = " user email does not exist"
    //     return errors
    // }

    return errors

}
module.exports = handleErrors