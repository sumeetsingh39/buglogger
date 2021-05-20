const mongoose = require('mongoose')


const connectDB = async() =>{
    try{
        const conn = await mongoose.connect('mongodb+srv://sumeet123:sumeet123@sum-proj.qksr6.mongodb.net/buglogger?retryWrites=true&w=majority',{
            useNewUrlParser:true,
            useCreateIndex:true,
            useUnifiedTopology:true
        })

        console.log('Mongo DB Connected');
    }
    catch(err){
        console.log(err)
        process.exit(1)
    }
}


module.exports = connectDB