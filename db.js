const  mongoose = require('mongoose')
const mongoURI = 'mongodb+srv://hamid25:bigapple25@noteaura.nouts3q.mongodb.net/?retryWrites=true&w=majority&appName=NoteAuraa'

const connectToMongo = async ()=>{
    const data = await mongoose.connect(mongoURI)
    console.log('connected to mongodb')
}

module.exports = connectToMongo;