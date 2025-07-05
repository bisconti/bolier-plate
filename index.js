const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose')
const uri = 'mongodb+srv://awnsals:rmaqkswl!12@cluster0.5bnx8zj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
