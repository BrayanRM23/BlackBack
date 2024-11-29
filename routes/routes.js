import { Router } from 'express';
import AWS from 'aws-sdk';
import {uploadFile, getFiles, getfile, getfileURL} from '../s3.js'
import {compareLogin, compareadmin, updatepassword, crearadmin, crearuser} from './controller.js'
import { UserArchivo } from "./models/UserArchivo.js";
import User from './models/user.js';
import { getAllPosts, getFilteredPosts } from "./userArchivoController.js"

const router = Router();
const s3 = new AWS.S3({
  accessKeyId: process.env.BUCKET_PAPA, // Usa tus credenciales de AWS
  secretAccessKey: process.env.UNA_PAPA,
  region: process.env.REGION_PAPA,
});

router
    .get('/files', async (req, res)=>{
        const result =await getFiles()
        res.json(result.Contents)
    })

    .post('/generate-presigned-url', async (req, res) => {
      const { username, fileName } = req.body;
    
      if (!username || !fileName) {
        return res.status(400).json({ error: 'Usuario y nombre de archivo requeridos.' });
      }
    
      try {
        // Buscar el usuario en la base de datos
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
    
        // Generar la URL prefirmada
        const s3Params = {
          Bucket: process.env.BUCKET_PAPA, // Nombre del bucket
          Key: `uploads/${fileName}`, // Nombre del archivo en S3
          Expires: 60 * 5, // La URL será válida por 5 minutos
          ContentType: 'application/octet-stream', // Tipo de contenido del archivo
        };
    
        const uploadUrl = await s3.getSignedUrlPromise('putObject', s3Params);
    
        // Retornar la URL prefirmada
        res.status(200).json({ uploadUrl, fileName });
      } catch (error) {
        console.error('Error al generar la URL prefirmada:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
      }
    })

    .post("/files", async (req, res) => {
        try {
          const { username } = req.body; // Obtenemos el usuario de la petición
          const file = req.files?.file;
      
          if (!file || !username) {
            return res.status(400).json({ error: "Archivo y usuario requeridos." });
          }
      
          // Buscar al usuario en la base de datos
          const user = await User.findOne({ username });
          if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
          }
      
          // Subir el archivo a S3
          const fileURL = await uploadFile(file);
      
          // Crear un registro en MongoDB
          const newArchivo = new UserArchivo({
            userId: user._id, // Relacionamos con el ID del usuario
            fileName: file.name,
            fileURL: fileURL,
          });
      
          await newArchivo.save();
      
          res.status(200).json({
            message: "Archivo subido y registrado con éxito.",
            fileURL,
          });
        } catch (error) {
          console.error("Error al subir archivo:", error);
          res.status(500).json({ error: "Error interno del servidor." });
        }
      })

    .post("/user-files", async (req, res) => {
        try {
          const { username } = req.body;
      
          if (!username) {
            return res.status(400).json({ error: "Se requiere el nombre de usuario." });
          }
      
          // Buscar al usuario en la base de datos
          const user = await User.findOne({ username });
          if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
          }
      
          // Obtener los archivos asociados al usuario
          const userFiles = await UserArchivo.find({ userId: user._id }).select("fileName fileURL");
      
          res.status(200).json(userFiles);
        } catch (error) {
          console.error("Error al obtener archivos:", error);
          res.status(500).json({ error: "Error interno del servidor." });
        }
      })
    
    .get('/:filename', async (req, res)=>{
        const result = await getfile(req.params.filename)
        res.json(result.$metadata)
    })

    .post("/all-posts", getAllPosts)
    .post("/filter-posts", getFilteredPosts)
    .post('/login', compareLogin)
    .post('/loginadmin', compareadmin)
    .post('/actualizar', updatepassword)
    .post('/registraradmin', crearadmin)
    .post('/crear', crearuser); // Nueva ruta para crear usuarios

    

export default router;

