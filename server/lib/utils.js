import jwt from "jsonwebtoken" ;

// Function to generateToken
//export: Are used to expose functionality from module to another modules in our app
// we can export functions, variables, classes and other javascript entities by using export keywors
export const generateToken = (userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}

