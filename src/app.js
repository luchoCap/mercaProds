import express from 'express';
const app = express();
import routesBooks from './routes/routes'
import cors from 'cors'


//middleware
app.use(cors())
app.use(express.json())

//routes
app.use('/',routesBooks)

module.exports = app