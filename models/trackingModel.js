const mongoose = require('mongoose')
const Schema = mongoose.Schema

const trackingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodId: {
        type: Schema.Types.ObjectId,
        ref: 'Foods',
        required: true
    },
    details: {
       
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fat: Number,
        fiber: Number,
    },
    eatenDate: {
        type: String,
        default: new Date().toLocaleDateString()
    },
    quantity: {
        type: Number,
        min: 1,
        required: true
    }

}, {timestamps: true})

const trackingModel = mongoose.model('tracking', trackingSchema)

module.exports = trackingModel