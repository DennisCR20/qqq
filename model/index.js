const express = require("express");
const path = require("path");
const session = require("express-session");
const RedisStore = require("connect-redis"); // Usamos connect-redis para almacenar sesiones en Redis
const redis = require("redis"); // Cliente Redis
const homeController = require("../controller/HomeController");
const app = express();

// Configuración de Redis con las credenciales del .env
const redisClient = redis.createClient({
    url: process.env.REDIS_URL // Usamos la variable de entorno REDIS_URL
});

redisClient.connect()
    .then(() => console.log("Conexión a Redis establecida"))
    .catch((err) => console.error("Error al conectar a Redis:", err));

// Configuración de sesión con RedisStore
app.use(session({
    store: new RedisStore({
        client: redisClient,  // Usamos el cliente Redis
    }),
    secret: process.env.SECRET_KEY,  // Usamos la clave secreta del .env
    resave: false,
    saveUninitialized: true
}));

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de directorios estáticos
app.use(express.static('view'));
app.use(express.static('uploads'));
app.use(express.static('assets'));
app.use(express.static(path.join(__dirname, "view")));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'assets')));

// Cargar el controlador después de configurar express-session
app.use("/", homeController);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
