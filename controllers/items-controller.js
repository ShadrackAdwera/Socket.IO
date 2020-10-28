const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const User = require('../models/User-model')
const Item = require('../models/Items-model')
const HttpError = require('../models/error-model')


const addItem = async(req,res,next) => {
    const { name, price } = req.body
    let foundUser

    const inputError = validationResult(req)
    if(!inputError.isEmpty()) {
        return next(new HttpError('Check your inputs son',422))
    }
    try {
        foundUser = await User.findById(req.userData.id)
    } catch (error) {
        return next(new HttpError('Unable to find user', 500))
    }
    if(!foundUser) {
        return next(new HttpError('User does not exist',404))
    }

    const newItem = new Item({
        name, price, user: req.userData.id
    })

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await newItem.save({session: sess })
        foundUser.items.push(newItem)
        await foundUser.save({session: sess})
        await sess.commitTransaction()
    } catch (error) {
        return next(new HttpError(error.message,500))
    }

    res.status(201).json({message: 'Item created', item: newItem.toObject({getters: true})})
}

const allItems = async(req,res,next) => {
    let items
    try {
        items = await Item.find().populate('user', '-password').exec()
    } catch (error) {
        return next(new HttpError('Server Error', 500))
    }
    if(!items || items.length===0) {
        return next(new HttpError('No items found for the user',404))
    }
    res.status(200).json({itemsFound: items.length, items: items.map(item=>item.toObject({getters: true}))})
}

const getItemById = async(req,res,next) => {
    const itemId = req.params.id
    let foundItem

    try {
        foundItem = await Item.findById(itemId).populate('user', '-password')
    } catch (error) {
        return next(new HttpError('Server error',500))
    }
    if(!foundItem) {
        return next(new HttpError('Item not found',404))
    }
    res.status(200).json({item: foundItem.toObject({getters: true})})
}

const getItemByUser = async(req,res,next) => {
    let foundItems
    const userId = req.params.id

    try {
        foundItems = await Item.find({user: userId}).populate('user', '-password').exec()
    } catch (error) {
        return next(new HttpError('Server error',500))
    }

    if(!foundItems || foundItems.length===0) {
        return next(new HttpError('No items found for the user',404))
    }
    res.status(200).json({itemsFound: foundItems.length, items: foundItems.map(item=>item.toObject({getters: true}))})

}

const updateItem = async(req,res,next) => {
    const { name, price } = req.body
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return next(new HttpError('Check your inputs son',422))
    }
    const itemId = req.params.id
    let foundItem

    let foundUser

    try {
        foundUser = await User.findById(req.userData.id)
    } catch (error) {
        return next(new HttpError('Server Error', 500))
    }
    if(!foundUser) {
        return next(new HttpError('User does not exist',404))
    }

    try {
        foundItem = await Item.findById(itemId)
    } catch (error) {
        return next(new HttpError('Server error',500))
    }
    if(!foundItem) {
        return next(new HttpError('Item not found',404))
    }
    if(foundItem.user.toString() !== req.userData.id) {
        return next(new HttpError('You are not authorized to perform this action', 403))
    }

    foundItem.name = name
    foundItem.price = price

    try {
        await foundItem.save()
    } catch (error) {
        return next(new HttpError('Server error',500))
    }
    res.status(200).json({message: 'Update Successful', item: foundItem.toObject({getters: true})})
}

const deleteItem = async(req,res,next) => {
    const itemId = req.params.id
    let foundItem
    let foundUser

    try {
        foundUser = await User.findById(req.userData.id)
    } catch (error) {
        return next(new HttpError('Server Error', 500))
    }
    if(!foundUser) {
        return next(new HttpError('User does not exist',404))
    }

    try {
        foundItem = await Item.findById(itemId)
    } catch (error) {
        return next(new HttpError('Server error',500))
    }
    if(!foundItem) {
        return next(new HttpError('Item not found',404))
    }
    if(foundItem.user.toString() !== req.userData.id) {
        return next(new HttpError('You are not authorized to perform this action', 403))
    }

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await foundItem.remove()
        foundUser.item.pull(item)
        await foundUser.save({session: sess})
        await sess.commitTransaction()
    } catch (error) {
        return next(new HttpError('Operation failed', 500))
    }
    res.status(200).json({message: 'Item deleted'})

}

exports.allItems = allItems
exports.getItemById = getItemById
exports.getItemByUser = getItemByUser
exports.addItem = addItem
exports.updateItem = updateItem
exports.deleteItem = deleteItem