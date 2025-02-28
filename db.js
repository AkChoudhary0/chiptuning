
const mongoose = require('mongoose')

const dbUrl = "mongodb+srv://anil:PSiv5ry8RhScc5b0@cluster0.s4yb1xe.mongodb.net/chiptuning"


const connection = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose
    .connect(dbUrl, connection)
    .then((res) => {
        console.info('Connected to db')
    })
    .catch((e) => {
        console.log('Unable to connect to the db', e)
    })