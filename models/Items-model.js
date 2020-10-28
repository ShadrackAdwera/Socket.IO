const mongoose = require('mongoose')

const itemsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
})

module.exports = mongoose.model('Item', itemsSchema)