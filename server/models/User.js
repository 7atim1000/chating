import mongoose from 'mongoose' ;

const userSchema = new mongoose.Schema({
    email: { type: String, required: true , unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true , minlength: 6 },
    profilePic: { type: String, default : "", default: 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD' },
    bio: { type: String }

}, {timestamps: true});

const User = mongoose.model("User", userSchema) ;
export default User;

// exports: Are used to exposed functionality from module to other modules in application
// we can imports "functions, variables, classes" and other javascript entities by using export keywords

// imports: Are used to bring functionality from other modules into current module in application
// we can imports export entities by using  import keywords 