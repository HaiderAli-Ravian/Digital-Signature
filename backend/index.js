const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const routes = require('./routes/routes')

const app = express()
const port = process.env.PORT || 3000  //this is the backend port where you get the input and store in database

//using necessary middlewares

app.use(cors({
    origin: 'http://localhost:4200',  //this is the frontend port where put input
    credentials: true
}));

app.use(cookieParser())

app.use(express.json())

app.use(routes)

//creating and connecting to mongoDB Database then after that listening to server
mongoose.connect('mongodb://127.0.0.1/tfa-auth', {
    useNewUrlParser:true

}).then(() => {
    console.log('Database is connected')
    app.listen(port, () => {
        console.log(`App is listening on post ${port}`)
    })

}).catch((err) => {
    console.log(err);
})



