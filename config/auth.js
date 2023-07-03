const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require("../models/User")
const User = mongoose.model("users")


module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) =>{
        User.findOne({email: email}).lean().then((user) =>{
            if(!user){
                return done(null, false, {message: "This account doesnt exist"})
            }

            bcrypt.compare(password, user.password, (error, match) =>{
                if(match){
                    return done(null, user)
                }else{
                    return done(null, false, {message: "Invalid password"})
                }
            })
        })
    }))

    passport.serializeUser((user, done) =>{
        done(null, user)
    })

    passport.deserializeUser((id, done) =>{
        User.findById(id).then((user) =>{
            done(null, user)
        }).catch((err) =>{
            done (null,false,{message:'Something went wrong'})
        })
    })
}