import  {UserArchivo}  from "./models/UserArchivo.js";
import  User  from "./models/user.js"; // Supongo que tienes el modelo User

// Obtener todos los posts ordenados por fecha
export const getAllPosts = async (req, res) => {
    try {
      // Obtener todos los registros de UserArchivo
      const archivos = await UserArchivo.find();
  
      // Crear una lista de promesas para buscar los nombres de usuario
      const posts = await Promise.all(
        archivos.map(async (archivo) => {
          // Buscar el usuario por su ID
          const user = await User.findById(archivo.userId);
          return {
            username: user ? user.username : "Usuario desconocido",
            fileName: archivo.fileName,
            fileURL: archivo.fileURL,
            uploadedAt: archivo.uploadedAt,
          };
        })
      );
  
      // Enviar la lista de posts al cliente
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error al obtener los posts:", error);
      res.status(500).json({ error: "Hubo un problema al obtener los posts." });
    }
  };

// Obtener posts filtrados por nombre de archivo o usuario
export const getFilteredPosts = async (req, res) => {
    const { filter, filterType } = req.body; // Recibimos datos desde el cuerpo de la petición
  
    try {
      let query = {};
  
      // Construcción dinámica del filtro
      if (filterType === "filename" && filter) {
        query.fileName = { $regex: filter, $options: "i" }; // Coincidencia parcial sin importar mayúsculas
      } else if (filterType === "user" && filter) {
        const user = await User.findOne({ username: { $regex: filter, $options: "i" } });
        if (user) {
          query.userId = user._id; // Filtramos por el ID del usuario encontrado
        } else {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
      }
  
      // Realizamos la búsqueda en la base de datos
      const filteredPosts = await UserArchivo.find(query)
        .sort({ uploadedAt: -1 }); // Ordenar por la fecha de subida en orden descendente
  
      // Mapear los resultados para incluir el nombre del usuario
      const postsWithUsername = await Promise.all(
        filteredPosts.map(async (post) => {
          const user = await User.findById(post.userId);
          return {
            username: user ? user.username : "Usuario desconocido",
            fileName: post.fileName,
            fileURL: post.fileURL,
            uploadedAt: post.uploadedAt,
          };
        })
      );
  
      res.status(200).json(postsWithUsername);
    } catch (error) {
      console.error("Error al filtrar los posts:", error);
      res.status(500).json({ error: "Error al filtrar los posts." });
    }
  };
  
