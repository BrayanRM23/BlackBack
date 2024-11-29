import fileUpload  from 'express-fileupload'
import cors from 'cors'
import router from './routes/routes.js'
import mongoose from 'mongoose'
import express, { urlencoded, json } from 'express'

const app = express()
app.use(cors())
app.use(urlencoded({ extended: true }))
app.use(json())

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
}))

app.use('/papa', router)

app.use(express.static('images'))

mongoose
    .connect(process.env.MONGO_URIEL)  
    .then(() => console.log("Connected to MongoDB Atlas"))  
    .catch((error) => console.error(error));
app.listen(4000)

console.log(`server on port ${4000}`)
