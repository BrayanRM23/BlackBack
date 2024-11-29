import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt'; // Asegúrate de tener bcrypt instalado: npm install bcrypt
import User from './models/user.js';
import Admin from './models/Admin.js';
import UserInfo from './models/UserInfo.js';

export const compareLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ resultado: "Usuario no encontrado" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.json({ resultado: "Credenciales inválidas" });
        }

        return res.json({ resultado: "user" });
    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).json({ resultado: "Error interno del servidor" });
    }
};


export const updatepassword = async (req, res) => {
    const { username, password, update } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            console.log(`Usuario '${username}' no encontrado.`);
            return res.status(404).json({ resultado: "Usuario no encontrado" });
        }

        if (user.password !== password) {
            console.log(`Contraseña incorrecta para el usuario '${username}'.`);
            return res.status(400).json({ resultado: "Credenciales inválidas" });
        }

        user.password = update;
        await user.save();

        console.log(`Contraseña del usuario '${username}' actualizada correctamente.`);
        return res.json({ resultado: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.log("Error al actualizar la contraseña:", error.message);
        return res.status(500).json({ resultado: "Error interno del servidor" });
    }
};

export const crearuser = async (req, res) => {
    const { username, password, birthdate, cedula, email, cellphone, city } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.json({ resultado: "El usuario ya existe" });
        }

        const cedulaExists = await UserInfo.findOne({ cedula });
        if (cedulaExists) {
            return res.json({ resultado: "La cédula ya está registrada" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUserInfo = new UserInfo({
            birthdate,
            cedula,
            email,
            cellphone,
            city
        });

        const savedUserInfo = await newUserInfo.save();
        console.log("UserInfo guardado con ID:", savedUserInfo._id);

        const newUser = new User({
            username,
            password: hashedPassword,
            info: savedUserInfo._id
        });

        await newUser.save();
        console.log("Usuario guardado con ID:", newUser._id);

        return res.json({ resultado: "Usuario creado correctamente" });
    } catch (error) {
        console.error("Error creando usuario:", error);
        return res.status(500).json({ resultado: "Error interno del servidor" });
    }
};

export const crearadmin = async (req, res) => {
    const { nombre, contrasena } = req.body;

    try {
        let adminExistente = await Admin.findOne({ nombre });
        if (adminExistente) {
            return res.status(400).json({ resultado: "Este nombre de administrador ya está en uso" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const nuevoAdmin = new Admin({
            nombre,
            contrasena: hashedPassword
        });

        await nuevoAdmin.save();

        return res.json({ resultado: "Administrador registrado correctamente" });
    } catch (error) {
        console.error("Error registrando administrador:", error);
        return res.status(500).json({ resultado: "Error interno del servidor" });
    }
};

export const compareadmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ nombre: username });

        if (!admin) {
            return res.json({ resultado: "Administrador no encontrado" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.contrasena);

        if (!isPasswordCorrect) {
            return res.json({ resultado: "Credenciales inválidas" });
        }

        return res.json({ resultado: "user" });
    } catch (error) {
        console.error("Error en el login del administrador:", error);
        return res.status(500).json({ resultado: "Error interno del servidor" });
    }
};
