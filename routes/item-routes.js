const express = require('express')
const { check } = require('express-validator')

const checkAuth = require('../middlewares/checkAuth')
const itemControllers = require('../controllers/items-controller')

const router = express.Router()

router.get('/all', itemControllers.allItems)
router.get('/:id', itemControllers.getItemById)
router.get('/user/:id', itemControllers.getItemByUser)

router.use(checkAuth)

router.post('/new', [ check('name').isLength({min: 6}), check('price').isNumeric() ], itemControllers.addItem)
router.patch('/:id', [ check('name').isLength({min: 6}), check('price').isNumeric() ], itemControllers.updateItem)
router.delete('/:id', itemControllers.deleteItem)

module.exports = router