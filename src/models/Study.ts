const mong = require('mongoose')
const bcr = require('bcrypt-nodejs')
const Sch = mong.Schema

const studySchema = new Sch({
    dni_paciente: Number,
    dni_medico: Number,
    nombre_paciente: String,
    apellido_paciente: String,
    resultado: String,
    centro: String,
    fecha: Date    
})

module.exports = mong.model('studies',studySchema)

