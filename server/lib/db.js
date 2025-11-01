import mongoose from 'mongoose' ;
import 'colors' ; 
// are used to expose functionality from module to other part in application , we can exports {functions, variables, classes} by using exports keyword
// named exports> default exports> named exports from expression
export const connectDB = async() => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Database Connected'))
        await mongoose.connect(`${process.env.MONGODB_URI}`)
    } catch (error) {
        console.log(error)
    }
}