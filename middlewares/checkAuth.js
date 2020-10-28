const jwt = require('jsonwebtoken')
const HttpError = require('../models/error-model')

const isAuth = (req,res,next) => {
    if (req.method === 'OPTIONS') {
        return next();
      }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if(!token) {
            return next(new HttpError('Auth failed!', 401))
        }
        const userPayload = jwt.verify(token, 'fucc_them_kids')
        req.userData = { id: userPayload.userId }
        next()
    } catch (error) {
        return next(new HttpError('AUth failed',401))
    }
}
module.exports = isAuth