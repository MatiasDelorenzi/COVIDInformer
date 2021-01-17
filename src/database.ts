const mongoose = require('mongoose')
import keys  from './keys'



mongoose.connect(keys.mongodb.URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useFindAndModify: false
    })
    .then(db => console.log( 'DB is Connected'))
    .catch(err => console.log(err))