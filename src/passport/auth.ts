const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Doctor = require('../models/Doctor.ts')
const Study = require ('../models/Study.ts')


passport.serializeUser((user, done)=>{
    done(null, user.id)
})

passport.deserializeUser( async (id,done)=>{
    const doctor = await Doctor.findById(id)
    done(null, doctor);
})


passport.use('local-signup', new LocalStrategy({
    usernameField: 'dni',
    passwordField: 'password',
    passReqToCallback:true
},async (req, dni, password, done)=>{
    const registeredDoctor = await Doctor.findOne({dni: dni})
    if (registeredDoctor){
        return done(null, false, req.flash('signupMessage', 'El DNI ' + req.body.dni + ' ya se encuentra registrado.'))
    }
    if (req.body.hospital === ""){
        return done(null, false, req.flash('signupMessage', 'Por favor seleccione un centro de salud.'))
    }
    if (password != req.body.passwordCheck){
        return done(null, false, req.flash('signupMessage', 'Las contraseñas no coinciden.'))
    }
    const newDoctor = new Doctor()
    newDoctor.dni = dni,
    newDoctor.password = newDoctor.encryptPassword(password),
    newDoctor.name = req.body.name,
    newDoctor.lastName = req.body.lastName
    newDoctor.hospital = req.body.hospital
    if (!req.body.role) {
        newDoctor.role = "doctor"
    } else if (req.body.role === "admin"){
        newDoctor.role = "admin"
    } else if (req.body.role === "doctor"){
        newDoctor.role = "doctor"
    }       
    newDoctor.save()
    done(null, null, req.flash('signupMessageSuccess', 'El médico ' + req.body.lastName + ' ' + req.body.name + ' fue registrado correctamente.'))        

}))


passport.use('local-signin', new LocalStrategy({
    usernameField: 'dni',
    passwordField: 'password',
    passReqToCallback:true
}, async (req, dni, password, done) =>{
    const registeredDoctor = await Doctor.findOne({dni: dni})
    if (!registeredDoctor){
        return done(null,false, req.flash('signinMessage', 'El usuario no existe'))
    } 
    if (!registeredDoctor.comparePassword(password)){
        return done(null, false, req.flash('signinMessage', 'Contraseña incorrecta'))
    }
    done(null, registeredDoctor)
}))


exports.changeMyPassword = async (req, res, done) =>{
    const doctorFound = await Doctor.findOne({ dni: req.user.dni})
    const actual = req.body.actualPassword
    const newPass = req.body.newPassword
    const newPassCheck = req.body.newPasswordCheck
    if (!doctorFound.comparePassword(actual)){
        return req.flash('signupMessage', 'Contraseña incorrecta.')
    }
    if (newPass != newPassCheck){
        return req.flash('signupMessage', 'Las contraseñas no coinciden.')
    }
    const newDoctor = new Doctor()
    await Doctor.findOneAndUpdate({dni: req.user.dni}, {$set: {"password": newDoctor.encryptPassword(newPass)}})
    return req.flash('signupMessageSuccess', 'Contraseña cambiada.')
}

exports.changeUserPassword =  async (req, res, done) =>{
    const doctorFound = await Doctor.findOne({ dni: req.body.dni})
    const newPass = req.body.newPassword
    const newPassCheck = req.body.newPasswordCheck
    if (newPass != newPassCheck){
        return req.flash('signupMessage', 'Las contraseñas no coinciden.')
    }
    if (req.user.role != "master"){
        if (doctorFound.role === "admin" || doctorFound.role === "master"){
            return req.flash('signupMessage', 'Usted no posee permisos para cambiar la contraseña de un administrador.')
        }
    }
    const newDoctor = new Doctor()
    await Doctor.findOneAndUpdate({dni: req.body.dni}, {$set: {"password": newDoctor.encryptPassword(newPass)}})
    return req.flash('signupMessageSuccess', 'Contraseña cambiada.')
}

exports.deleteUser = async (req, res)=>{
    const dni = req.body.dni
    const dni2 = req.body.dni2
    const userFound = await Doctor.findOne({dni: dni})
    if (dni != dni2){
        return req.flash('signupMessage','Los DNI no coinciden.')
    } 
    if (!userFound){
        return req.flash('signupMessage', 'El usuario con el DNI '+dni +' no existe.')
    }
    await Doctor.deleteOne({dni: dni})
    return req.flash('signupMessageSuccess','El usuario '+dni+' fue eliminado.')
}

exports.addStudy = async (req, res)=>{
    let doctor_dni = 0
    let study_hospital = ""
    if (req.user.role == "master"){
        doctor_dni = req.body.doctor_dni
        study_hospital = req.body.hospital
    } else{
        doctor_dni = req.user.dni
        study_hospital = req.user.hospital
    }
    const patient_dni = req.body.patient_dni
    const patient_name = req.body.patient_name
    const patient_lastName = req.body.patient_lastName
    const result = req.body.result
    const date = req.body.date
    const studyFound = await Study.findOne({dni_paciente: patient_dni, fecha: date})
    const doctorFound = await Doctor.findOne({dni: doctor_dni})
    if (!doctorFound){
        return req.flash('signupMessage', 'El médico no está registrado en el sistema.')
    }
    if (studyFound){
        return req.flash('signupMessage', 'El estudio ya fue cargado.')
    }
    const newStudy = new Study()
    console.log(doctorFound)
    newStudy.dni_paciente = patient_dni
    newStudy.nombre_medico = doctorFound.name
    newStudy.apellido_medico = doctorFound.lastName
    newStudy.nombre_paciente = patient_name
    newStudy.apellido_paciente = patient_lastName
    newStudy.resultado = result
    newStudy.centro = study_hospital
    newStudy.fecha = date
    newStudy.save()
    return req.flash('signupMessageSuccess', 'El estudio se cargó correctamente')
}

exports.getStudies = async (req,res,next)=>{
    const studiesFound = await Study.find({dni_paciente: req.body.patient_dni})
    return studiesFound
}