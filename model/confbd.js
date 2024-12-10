const dotenv = require("dotenv");
dotenv.config();
const mysql = require('mysql2');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
let connection;


try {
    connection = mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DBNAME,
        port: process.env.DBPORT || 3306
    });
} catch (error) {
    console.log("Error al conectar con la base de datos");
}

const generateKey = (key) => {
    return crypto.createHash('sha256').update(key).digest(); // Esto genera una clave de 32 bytes
};

const SECRET_KEY = generateKey(process.env.SECRET_KEY || 'your-secret-key');
const ALGORITHM = 'aes-256-ecb'; // Cambiado a ECB

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, null); // Sin IV
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted; // Devolver el texto cifrado
};
const decrypt = (text) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), null); // Sin IV
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
const verifyPassword = (password, hash) => {
    return bcrypt.compare(password, hash);
};
const registrarUsuario = async (correo, password, nombre, p1, r1, p2, r2, p3, r3, callback) => {
    try {
        const encryptedEmail = encrypt(correo);
        const encryptedPassword = encrypt(password);
        const encryptedP1 = encrypt(p1);
        const encryptedR1 = encrypt(r1);
        const encryptedP2 = encrypt(p2);
        const encryptedR2 = encrypt(r2);
        const encryptedP3 = encrypt(p3);
        const encryptedR3 = encrypt(r3);

        const query = "CALL insertarlogin(?, ?, ?, ?, ?, ?, ?, ?, ?)";
        connection.query(query, [encryptedEmail, encryptedPassword, nombre, encryptedP1, encryptedR1, encryptedP2, encryptedR2, encryptedP3, encryptedR3], (err, results) => {
            if (err) return callback(err);
            return callback(null, results);
        });
    } catch (error) {
        return callback(error);
    }
};
const verificarUsuario = async (correo, password, ip, callback) => {
    try {
        const encryptedEmail = encrypt(correo);
        const encryptedPassword = encrypt(password);

        connection.query("CALL insertarusuario(?, ?)", [encryptedEmail, encryptedPassword], (err, results) => {
            if (err) {
                return callback(err);
            }

            // Aquí estamos buscando el user_id en el primer resultado
            const userId = results[0][0] ? results[0][0].user_id : null;  // Asegúrate de que 'user_id' existe en el resultado de la consulta

            // Si el user_id es null, significa que el usuario no se encontró
            if (!userId) {
                return callback(null, 'Usuario no encontrado');
            }

            // Si la autenticación fue exitosa, registramos la auditoría
            let actionType = 'Intento de inicio de sesión';
            let details = 'Fallo';
            if (results[0][0]) {
                actionType = 'Inicio de sesión';
                details = 'Éxito';
            }

            // Registrar evento de auditoría, ahora incluyendo la IP
            registrarAuditoria(encryptedEmail, actionType, details, ip);

            return callback(null, results[0][0].mensaje);  // Devolver el mensaje que has recibido
        });
    } catch (error) {
        return callback(error);
    }
};
const obtenerUsuario = async (correo, callback) => {
    try {
        const encryptedEmail = encrypt(correo);
        console.log("Correo cifrado:", encryptedEmail);  // Verifica el valor cifrado

        connection.query("CALL obtenerUsuario(?)", [encryptedEmail], (err, results) => {
            if (err) {
                console.error("Error al ejecutar la consulta:", err);  // Más detalles sobre el error
                return callback(err, null);
            }

            console.log("Resultado de la consulta:", results);  // Verifica el resultado de la consulta

            if (results && results.length > 0) {
                const usuario = results[0]; // Verifica que el primer resultado es el correcto
                return callback(null, usuario);
            } else {
                console.log("No se encontraron resultados para el correo cifrado:", encryptedEmail);
                return callback(null, []);  // No se encontraron resultados
            }
        });
    } catch (error) {
        console.error("Error al cifrar correo:", error);  // Si hay un error al cifrar
        return callback(error, null);
    }

};
const registrarAuditoria = (correo, actionType, details) => {
    // Encriptamos el correo antes de verificarlo en la base de datos
    const encryptedEmail = encrypt(correo);

    // Verificar si el correo existe en la tabla login (correo encriptado)
    connection.query('SELECT * FROM login WHERE correo = ?', [encryptedEmail], (err, results) => {
        if (err) {
            console.log('Error al verificar el usuario:', err);
            return;
        }
        if (results.length > 0) {
            // El usuario existe, se puede registrar la auditoría
            const query = 'INSERT INTO auditoria (user_id, action_type, details) VALUES (?, ?, ?)';
            // Aquí también encriptamos la acción y los detalles si deseas hacerlo
            const encryptedActionType = encrypt(actionType);  // Encriptar acción
            const encryptedDetails = encrypt(details);        // Encriptar detalles

            connection.query(query, [encryptedEmail, encryptedActionType, encryptedDetails], (err, results) => {
                if (err) {
                    console.log('Error al registrar auditoría:', err);
                } else {
                    console.log('Auditoría registrada con éxito');
                }
            });
        } else {
            console.error('El correo no existe en la base de datos de login');
        }
    });
};
const verificarIntentos = (correo) => {
    connection.query('SELECT * FROM login WHERE correo = ?', [correo], (err, results) => {
        if (err) {
            console.log('Error al verificar los intentos:', err);
            return;
        }
        if (results.length > 0) {
            const usuario = results[0];
            if (usuario.intentos_fallidos >= 3 && usuario.bloqueo_hasta > new Date()) {
                console.log('Usuario bloqueado por demasiados intentos fallidos');
            } else {
                console.log('Usuario permitido para cambios');
            }
        } else {
            console.error('El correo no existe en la base de datos');
        }
    });
};
const agregarConsola = (marca, nombre, img, descripcion, precio, cantidad, callback) => {
    const query = "CALL insertarConsola(?,?, ?, ?, ?, ?)";
    connection.query(query, [marca, nombre, img, descripcion, precio, cantidad], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const verconsola = (callback) => {
    const query = 'CALL verConsolas()';
    connection.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const verconsolaPorMarca = (marca, callback) => {
    const query = 'CALL verConsolasPorMarca(?)';
    connection.query(query, [marca], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const eliminarConsola = (idConsola, callback) => {
    const query = 'CALL eliminarConsola(?)';
    connection.query(query, [idConsola], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const agregarJuego = (marca, nombre, img, descripcion, precio, cantidad, callback) => {
    const query = "CALL insertarJuego(?,?, ?, ?, ?, ?)";
    connection.query(query, [marca, nombre, img, descripcion, precio, cantidad], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const verJuego = (callback) => {
    const query = 'CALL verJuegos()';
    connection.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const verjuegoPorMarca = (marca, callback) => {
    const query = 'CALL verJuegosPorMarca(?)';
    connection.query(query, [marca], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const eliminarJuego = (idvideo_juegos, callback) => {
    const query = 'CALL eliminarJuego(?)';
    connection.query(query, [idvideo_juegos], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const agregarAccesorio = (marca, nombre, img, descripcion, precio, cantidad, callback) => {
    const query = "CALL insertarAccesorio(?,?, ?, ?, ?, ?)";
    connection.query(query, [marca, nombre, img, descripcion, precio, cantidad], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const verAccesorio = (callback) => {
    const query = 'CALL verAccesorios()';
    connection.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const veraccesorioPorMarca = (marca, callback) => {
    const query = 'CALL verAccesoriosPorMarca(?)';
    connection.query(query, [marca], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const eliminarAccesorio = (idaccesorios, callback) => {
    const query = 'CALL eliminarAccesorio(?)';
    connection.query(query, [idaccesorios], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
const obtenerPreguntas = (correo, callback) => {
    const encryptedEmail = encrypt(correo); // Encriptar el correo

    const query = `
        SELECT c.p1, c.p2, c.p3
        FROM cliente c
        INNER JOIN login l ON c.idcorreo = l.correo
        WHERE l.correo = ?;
    `;

    connection.query(query, [encryptedEmail], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return callback("Error al cargar las preguntas.", null);
        }

        console.log("Resultados de la consulta:", results); // Log de resultados

        if (results.length > 0) {
            const decryptedQuestions = {
                p1: decrypt(results[0].p1),
                p2: decrypt(results[0].p2),
                p3: decrypt(results[0].p3),
            };
            return callback(null, [decryptedQuestions]); // Retorna un array
        } else {
            console.log("No se encontraron preguntas para el correo:", correo);
            return callback(null, []); // Retorna un array vacío
        }
    });
};
const validarRespuestas = (correo, r1, r2, r3, callback) => {
    const encryptedEmail = encrypt(correo);
    const encryptedR1 = encrypt(r1);
    const encryptedR2 = encrypt(r2);
    const encryptedR3 = encrypt(r3);

    const query = `
        SELECT CASE 
            WHEN c.r1 = ? AND c.r2 = ? AND c.r3 = ? THEN TRUE
            ELSE FALSE
        END AS isValid
        FROM cliente c
        INNER JOIN login l ON c.idcorreo = l.correo
        WHERE l.correo = ?;
    `;
    connection.query(query, [encryptedR1, encryptedR2, encryptedR3, encryptedEmail], (err, results) => {
        const actionType = results[0] && results[0].isValid ? 'Respuestas correctas' : 'Respuestas incorrectas';
        const details = results[0] && results[0].isValid ? 'Éxito' : 'Fallo';

        // Registrar evento de auditoría
        registrarAuditoria(correo, actionType, details);

        if (err) return callback(err, null);
        return callback(null, results[0] ? results[0].isValid : false);
    });
};
const cambiarPassword = (correo, nuevaPassword, callback) => {
    const encryptedEmail = encrypt(correo);
    const encryptedPassword = encrypt(nuevaPassword);

    const query = `
        UPDATE login
        SET password = ?
        WHERE correo = ?;
    `;
    connection.query(query, [encryptedPassword, encryptedEmail], (err, results) => {
        const actionType = err ? 'Intento de cambio de contraseña' : 'Cambio de contraseña';
        const details = err ? 'Fallo' : 'Éxito';

        // Registrar evento de auditoría
        registrarAuditoria(correo, actionType, details);

        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const verpais = (callback) => {
    const query = "SELECT idubucacion, descripcion FROM ubucacion WHERE referencia IS NULL";
    connection.query(query, (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const verpro = (idubicacion, callback) => {
    const query = "SELECT idubucacion, descripcion FROM ubucacion WHERE referencia = ?";
    connection.query(query, [idubicacion], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const verCantones = (idubicacion, callback) => {
    const query = "SELECT idubucacion, descripcion FROM ubucacion WHERE referencia = ?";
    connection.query(query, [idubicacion], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const verDistritos = (idubicacion, callback) => {
    const query = "SELECT idubucacion, descripcion FROM ubucacion WHERE referencia = ?";
    connection.query(query, [idubicacion], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};

module.exports = {
    //Usuario
    registrarUsuario,
    verificarUsuario,
    //Consola
    agregarConsola,
    verconsola,
    verconsolaPorMarca,
    eliminarConsola,
    //Juegos
    agregarJuego,
    verJuego,
    verjuegoPorMarca,
    eliminarJuego,
    //Accesorios
    agregarAccesorio,
    verAccesorio,
    veraccesorioPorMarca,
    eliminarAccesorio,
    //contraseña
    obtenerPreguntas,
    validarRespuestas,
    cambiarPassword,
    //ubicacion
    verpais,
    verpro,
    verCantones,
    verDistritos,
    verificarIntentos,
    obtenerUsuario,

    connection,
};