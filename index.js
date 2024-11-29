import fileUpload from 'express-fileupload';
import cors from 'cors';
import router from './routes/routes.js';
import mongoose from 'mongoose';
import express, { urlencoded, json } from 'express';

const app = express();
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads',
}));

app.use('/papa', router);

app.use(express.static('images'));

// Ruta para mostrar el mensaje en la raíz
app.get('/', (req, res) => {
    res.send('Este es el Backend de Black Tube');
});

mongoose
    .connect(process.env.MONGO_URIEL)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((error) => console.error(error));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});
