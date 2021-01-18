const expr = require('express')
const router= expr.Router()
const passport = require('passport')
const Doctor = require('../models/Doctor.ts')
const {changeMyPassword, changeUserPassword, deleteUser, addStudy, getStudies} = require('../passport/auth.ts')


//SIGNUP

router.get('/signup', isAdmin, (req, res, next)=>{
    res.render('signup')
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    passReqToCallback: true
}))

//SIGNIN

router.get('/signin', (req, res, next)=>{
    res.render('signin')
})

router.post('/signin', passport.authenticate('local-signin',{
    successRedirect: '/',
    failureRedirect: '/signin',
    passReqToCallback: true
}))

router.get('/logout', (req, res, next)=>{
    req.logout();
    res.redirect('/')
})



//CHANGE PASSWORD

router.get('/changeMyPassword', isAuthenticated, (req, res,next)=>{
    res.render('changeMyPassword')
})

router.post('/changeMyPassword', async (req,res,next)=>{
    await changeMyPassword(req)
    res.redirect('/changeMyPassword')
})

//CHANGE USER PASSWORD
router.get('/changeUserPassword', isAdmin, (req, res, next)=>{
    res.render('changeUserPassword')
})

router.post('/changeUserPassword', async (req, res, next)=>{
    await changeUserPassword(req)
    res.redirect('/changeUserPassword')
})

//SEARCH USER
router.get('/deleteUser', isAdmin, (req, res, next)=>{
    res.render('deleteUser')
})

router.post('/deleteUser', async (req, res, next)=>{
    await deleteUser(req)
    res.redirect('deleteUser')
})

//LIST DOCTORS
router.get('/doctorList', isAdmin, (req, res,next)=>{
    res.render('doctorList')
})

//ADD STUDY
router.get('/addstudy', isDoctor, (req, res, next)=>{
    res.render('addstudy')
})

router.post('/addstudy', async (req, res, next)=>{
    await addStudy(req)
    res.redirect('addstudy')
})

//HOME - SEARCH STUDY

router.get('/', (req, res, next) =>{
    res.render('index')
})

router.post('/', async (req,res,next)=>{
    const studies = await getStudies(req)
    console.log(studies)
    res.render('studiesResult', {data: studies})
})

//MIDDLEWARE

function isAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    } 
    res.redirect('/signin')
}

function isAdmin(req, res,next){
    if (req.isAuthenticated()){
        if (req.user.role === "admin" || req.user.role === "master"){
            return next()
        }
    }
    
    res.redirect('/signin')
}

function isDoctor(req, res, next){
    if (req.isAuthenticated()){
        if (req.user.role === "doctor" || req.user.role === "master"){
            return next()
        }
    }
    res.redirect('/signin')
}


export default router