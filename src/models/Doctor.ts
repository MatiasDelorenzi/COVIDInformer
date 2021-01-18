const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const { Schema } = mongoose

const doctorSchema = new Schema({
    dni: Number,
    password: String,
    name: String,
    lastName: String,
    hospital:String,
    role:String
})

doctorSchema.methods.encryptPassword = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

doctorSchema.methods.comparePassword = function (password){
    return bcrypt.compareSync(password, this.password)
} 

module.exports = mongoose.model('doctors',doctorSchema)

