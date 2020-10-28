const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const userRoutes = require('./routes/user-routes')
const itemRoutes = require('./routes/item-routes')
const HttpError = require('./models/error-model')

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'PUT, PATCH, POST, DELETE, GET'
    );
    next();
  });

app.use('/api/users', userRoutes)
app.use('/api/items', itemRoutes)

app.use((req,res,next)=>{
    return next(new HttpError('Unable to find route | path', 404))
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
      return next(error);
    }
    res
      .status(error.code || 500)
      .json({ message: error.message || 'An error occurred' });
  });

mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(()=>{
    console.log('Connected to DB...')
    app.listen(5000)
}).catch(error=>{
    console.log(error.message)
})