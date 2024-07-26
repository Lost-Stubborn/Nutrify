const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
//models
const User = require('./models/User')
const Food = require('./models/foodModel')
const trackingModel = require('./models/trackingModel')

const verifyToken = require('./verifyToken')
const cors = require('cors')
// mongodb://localhost:27017/nutrify

mongoose.connect("mongodb+srv://shivangUser:MkEhaQuzrNyeXUIj@cluster0.hfxgmwk.mongodb.net/")
    .then(() => {
        console.log('Database Connection Successful')
    })
    .catch((err) => {
        console.log(err)
    })

const app = express()

app.use(express.json())
app.use(cors())


app.get('/foods', verifyToken, async (req,res) => {
    try {
        let foods = await Food.find()
        res.send(foods)
    }
    catch(err) {
        console.log(err)
        res.status(500).send({ message: "Some problem while getting info." })
    }
})

app.get('/foods/:name', verifyToken, async (req,res) => {
    try {
        let foods = await Food.find({ name: {$regex: req.params.name, $options: "i"} })
        if(foods.length !== 0) {
            res.send(foods)
        }
        else {
            res.status(404).send({ message: "Food item not found."})
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ message: "Some problem in getting the food."})
    }
})

app.get('/track/:userid/:date', verifyToken, async (req,res) => {
    let userid = req.params.userid
    let date = new Date(req.params.date)
    let strDate =  (date.getMonth()+1) + "/" + date.getDate()  + "/" + date.getFullYear()
    console.log(strDate)

    try {
        let foods = await trackingModel.find({ userId: userid, eatenDate: strDate}).populate('userId').populate('foodId')
        console.log(foods)
        res.send(foods)
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ message: "Some problem in getting the food."})
    }
})

app.post('/login', async (req,res) => {
    let { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if( user ) {
            bcrypt.compare(password, user.password, (err,success) => {
                if(success) {
                    jwt.sign({ email: user.email }, "nutrifyapp", (err,token) => {
                        if( !err ) {
                            let name = user.name
                            let id = user.id
                            res.send({ name,  message: "Login Success", token: token, userid: id})
                        }
                    })
                } 
                else {
                    res.status(403).send({ message: "Invalid Password."})
                }
            })
        }
        else {
            res.status(404).send({ message: "User not found."})
        }
    }
    catch (err) {
        res.status(500).send({ message: "Some problem."})
    }
})


app.post('/register', (req,res) => {
    let user = req.body
    bcrypt.genSalt(12, (err, salt) => {
        if(!err) {
            bcrypt.hash(user.password, salt, async (err,hpass) => {
                if( !err ) {
                    user.password = hpass
                    try {

                        let doc = await User.create(user)
                        res.status(201).send({ message: "User Registered."})
                    }
                    catch(err) {
                        console.log(err)
                        res.status(500).send({ message: "Some problem."})
                    }
                }
            })
        }
    })
})

app.post('/track', verifyToken, async (req,res) => {
    let trackData = req.body

    try {
        let data = await trackingModel.create(trackData)
        res.status(201).send({ message: "Food Added."})
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ message: "Some problem in getting food."})
    }
})



app.listen(8000, () => {
    console.log("PORT 8000 IS LIVE.")
})