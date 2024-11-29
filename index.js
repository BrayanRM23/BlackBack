import fileUpload from 'express-fileupload';
import cors from 'cors';
import router from './routes/routes.js';
import mongoose from 'mongoose';
import express, { urlencoded, json } from 'express';

const app = express();

// Middleware de configuración
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

// Configuración de fileUpload con límite de tamaño
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads',
    limits: { fileSize: 50 * 1024 * 1024 }, // Límite de 50 MB
}));

// Rutas del backend
app.use('/papa', router);

// Servir archivos estáticos desde la carpeta 'images'
app.use(express.static('images'));

// Ruta para mostrar el mensaje en la raíz
app.get('/', (req, res) => {
    res.send('Este es el Backend de Black Tube');
});

// Conexión a MongoDB
mongoose
    .connect(process.env.MONGO_URIEL)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((error) => console.error(error));

// Inicia el servidor
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});

