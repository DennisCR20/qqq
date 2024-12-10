const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const paypal = require('@paypal/paypal-server-sdk');
const xml2js = require('xml2js');
const axios = require("axios");
const soap = require('soap');
const multer = require('multer');
const router = express.Router();
const db = require("../model/confbd");


router.get("/", (req, res) => {
    // El frontend controlará si se debe mostrar el onboarding usando `localStorage`
    res.sendFile(path.join(__dirname, "../view/index.html"));
});

// Ruta para marcar que el onboarding se completó


const transporter = nodemailer.createTransport({
    service: 'gmail', // O el servicio de correo que estés usando
    auth: {
        user: 'sanchezvalderramosd@gmail.com', // Tu correo electrónico
        pass: 'dtyv aawl tnna fjdo ' // Tu contraseña o App Password
    }
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const mime = {
    'html': 'text/html',
    'css': 'text/css',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'ico': 'image/x-icon',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4'
};
// Almacenamos los tokens de manera temporal
let tokenStorage = {}; // Objeto para almacenar tokens
router.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'perfil.html'));
});
router.use("/assets", express.static(path.join(__dirname, "../assets")));
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));
router.use(express.static(path.join(__dirname, '../view')));
router.get("/registrarse.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/registrarse.html"));
});
router.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/login.html"));
});
router.get("/perfil.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/perfil.html"));
});
router.get("/agregarConsolas.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/agregarConsolas.html"));
});
router.get("/agregarJuegos.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/agregarJuegos.html"));
});
router.post("/cargarU", (req, res) => {
    const { correo, password, nombre, p1, r1, p2, r2, p3, r3 } = req.body;
    db.registrarUsuario(correo, password, nombre, p1, r1, p2, r2, p3, r3, (err, result) => {
        if (err) {
            console.error("Error al registrar usuario:", err);
            return res.status(500).send("Error al registrar usuario");
        }
        // Enviar el correo con el token
        const mailOptions = {
            from: 'sanchezvalderramosd@gmail.com',
            to: correo,
            subject: 'Registro Completado',
            text: `Gracias ${correo} por registrarte`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send("Error al enviar el correo");
            }
            console.log("Correo enviado: " + info.response);
        });


        res.redirect("/login.html");
    });
});
let storedToken = null; // Almacenar el token

let failedAttempts = {};  // Objeto para almacenar los intentos fallidos por correo

// Ruta de inicio de sesión
router.post("/cargarL", (req, res) => {
    const { correo, password } = req.body;
    const userIP = req.ip;

    // Verificar si el correo está bloqueado
    if (failedAttempts[correo] && failedAttempts[correo].blocked) {
        return res.status(403).json({
            message: "Tu cuenta está bloqueada debido a múltiples intentos fallidos. Por favor, contacta con soporte.",
            blocked: true
        });
    }

    // Verificar las credenciales en la base de datos
    db.verificarUsuario(correo, password, userIP, (err, result) => {
        if (err) {
            // Lógica de intentos fallidos
            if (err.code === 'ER_SIGNAL_EXCEPTION' && err.sqlMessage === 'Contraseña incorrecta.') {
                if (!failedAttempts[correo]) {
                    failedAttempts[correo] = { attempts: 1, blocked: false };
                } else {
                    failedAttempts[correo].attempts += 1;
                }

                const attemptsLeft = 3 - failedAttempts[correo].attempts;

                if (failedAttempts[correo].attempts >= 3) {
                    failedAttempts[correo].blocked = true;
                    return res.status(403).json({
                        message: "Has alcanzado el número máximo de intentos fallidos. Tu cuenta está bloqueada.",
                        blocked: true
                    });
                }

                return res.status(401).json({
                    message: `Correo o contraseña incorrectos. Te quedan ${attemptsLeft} intentos.`,
                    blocked: false,
                    attemptsLeft
                });
            } else {
                console.error("Error al ingresar:", err);
                return res.status(500).send("Error al ingresar");
            }
        }

        if (result.length > 0) {
            failedAttempts[correo] = { attempts: 0, blocked: false };

            const token = crypto.randomBytes(4).toString("hex");
            storedToken = token;

            // Almacenar el correo en la sesión
            req.session.correo = correo; // Usamos una sesión para almacenar el correo

            const mailOptions = {
                from: 'sanchezvalderramosd@gmail.com',
                to: correo,
                subject: 'Su token de acceso',
                text: `Su token de acceso es: ${token}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).send("Error al enviar el correo");
                }
                console.log("Correo enviado: " + info.response);
                res.json({
                    success: true,
                    token: token,
                    message: "Inicio de sesión exitoso. Redirigiendo...",
                    blocked: false
                });
            });
        } else {
            return res.status(401).json({
                message: "Correo o contraseña incorrectos.",
                blocked: false
            });
        }
    });
});
router.post('/cargarPer', (req, res) => {
    const correo = req.session.correo;

    if (!correo) {
        return res.status(400).json({ message: 'Correo no encontrado en la sesión.' });
    }

    db.obtenerUsuario(correo, (err, result) => {
        if (err) {
            console.error("Error al obtener usuario:", err);
            return res.status(500).json({ message: 'Error al cargar perfil' });
        }

        const usuario = result[0];  // El primer elemento de result contiene los datos
        console.log("Datos del usuario:", usuario);  // Verifica que contiene los datos correctos

        if (usuario && usuario.idcorreo) {
            console.log("Nombre:", usuario.nombre);
            console.log("Correo (idcorreo):", usuario.idcorreo);  // Devuelve el idcorreo en lugar de correo
            return res.json({
                success: true,
                nombre: usuario.nombre,
                correo: usuario.idcorreo  // Enviar idcorreo como correo
            });
        } else {
            console.log("No se encontraron resultados para el correo:", correo);
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    });
});
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send("Error al cerrar sesión.");
        }
        res.send("Sesión cerrada correctamente.");
    });
});
router.post("/cargarCons", upload.single('imagenConsola'), (req, res) => {
    const { marca, nombre, descripcion, precio, cantidad } = req.body;
    const img = req.file.filename;


    db.agregarConsola(marca, nombre, img, descripcion, precio, cantidad, (err, result) => {
        if (err) {
            console.error("Error al guardar consola:", err);
            return res.status(500).send("Error al guardar consola.");
        }
        res.send("Consola guardada con éxito");
    });

});
router.get('/api/consolas', (req, res) => {
    const marca = req.query.marca;

    if (marca) {

        db.verconsolaPorMarca(marca, (err, results) => {
            if (err) {
                return res.status(500).send('Error al obtener las consolas');
            }
            res.json(results);
        });
    } else {

        db.verconsola((err, consolas) => {
            if (err) {
                console.error("Error al obtener las consolas:", err);
                return res.status(500).json({ error: "Error al obtener consolas" });
            }
            res.json(consolas);
        });
    }
});
router.delete('/api/consolas/:id', (req, res) => {
    const idConsola = req.params.id;

    if (idConsola) {

        db.eliminarConsola(idConsola, (err, results) => {
            if (err) {
                return res.status(500).send('Error al obtener las consolas');
            }
            res.json(results);
        });
    }
});
router.post("/cargarJu", upload.single('imagenJuego'), (req, res) => {
    const { marca, nombre, descripcion, precio, cantidad } = req.body;
    const img = req.file.filename;


    db.agregarJuego(marca, nombre, img, descripcion, precio, cantidad, (err, result) => {
        if (err) {
            console.error("Error al guardar juego:", err);
            return res.status(500).send("Error al guardar juego.");
        }
        res.send("Juego guardado con éxito");
    });

});
router.get('/api/juegos', (req, res) => {
    const marca = req.query.marca;

    if (marca) {

        db.verjuegoPorMarca(marca, (err, results) => {
            if (err) {
                return res.status(500).send('Error al obtener los juegos');
            }
            res.json(results);
        });
    } else {

        db.verJuego((err, juegos) => {
            if (err) {
                console.error("Error al obtener los juegos:", err);
                return res.status(500).json({ error: "Error al obtener juegos" });
            }
            res.json(juegos);
        });
    }
});
router.delete('/api/juegos/:id', (req, res) => {
    const idvideo_juegos = req.params.id;

    if (idvideo_juegos) {

        db.eliminarJuego(idvideo_juegos, (err, results) => {
            if (err) {
                return res.status(500).send('Error al obtener las juegos');
            }
            res.json(results);
        });
    }
});
router.post("/cargarAcce", upload.single('imagenAccesorio'), (req, res) => {
    const { marca, nombre, descripcion, precio, cantidad } = req.body;
    const img = req.file.filename;


    db.agregarAccesorio(marca, nombre, img, descripcion, precio, cantidad, (err, result) => {
        if (err) {
            console.error("Error al guardar juego:", err);
            return res.status(500).send("Error al guardar Accesorio.");
        }
        res.send("Accesorio guardado con éxito");
    });

});
router.get('/api/accesorios', (req, res) => {
    const marca = req.query.marca;

    if (marca) {

        db.veraccesorioPorMarca(marca, (err, results) => {
            if (err) {
                return res.status(500).send('Error al obtener los juegos');
            }
            res.json(results);
        });
    } else {

        db.verAccesorio((err, juegos) => {
            if (err) {
                console.error("Error al obtener los juegos:", err);
                return res.status(500).json({ error: "Error al obtener juegos" });
            }
            res.json(juegos);
        });
    }
});
router.delete('/api/accesorios/:id', (req, res) => {
    const idaccesorios = req.params.id;

    if (idaccesorios) {

        db.eliminarAccesorio(idaccesorios, (err, results) => {
            if (err) {
                return res.status(500).send('Error al obtener las juegos');
            }
            res.json(results);
        });
    }
});
router.post("/cargarNpass", (req, res) => {
    const { email, passwordn, passwordnn, p1, r1, p2, r2, p3, r3 } = req.body;

    if (passwordn !== passwordnn) {
        return res.status(400).send("Las contraseñas no coinciden.");
    }

    db.obtenerPreguntas(email, (err, preguntas) => {
        if (err || preguntas.length === 0) {
            return res.status(400).send("Correo no encontrado o error al obtener preguntas.");
        }

        // Aquí se asume que las preguntas están en el orden: p1, p2, p3
        db.verificarRespuestas(email, r1, r2, r3, (err, valido) => {
            if (err) return res.status(500).send("Error al verificar respuestas.");

            if (valido) {
                db.cambiarContrasena(email, passwordn, (err) => {
                    if (err) return res.status(500).send("Error al cambiar la contraseña.");
                    res.send("Contraseña cambiada con éxito.");
                });
            } else {
                res.status(400).send("Respuestas incorrectas.");
            }
        });
    });
});
// Ruta para cargar las preguntas de seguridad
router.post("/api/cargarPreguntas", (req, res) => {
    const { correo } = req.body;

    db.obtenerPreguntas(correo, (err, result) => {
        if (err) {
            console.error("Error al obtener preguntas:", err); // Log del error
            return res.status(500).send({ success: false, error: "Error al obtener preguntas" });
        }

        if (result.length > 0) {
            console.log("Preguntas obtenidas:", result[0]); // Log de las preguntas
            res.send({
                success: true,
                pregunta1: result[0].p1,
                pregunta2: result[0].p2,
                pregunta3: result[0].p3
            });
        } else {
            console.log("No se encontraron preguntas para el correo:", correo); // Log para el caso donde no hay preguntas
            res.send({ success: false });
        }
    });
});
// Ruta para cambiar la contraseña
router.post("/api/cambiarPassword", (req, res) => {
    const { correo, respuesta1, respuesta2, respuesta3, nuevaPassword } = req.body;
    db.validarRespuestas(correo, respuesta1, respuesta2, respuesta3, (err, isValid) => {
        if (err) return res.status(500).send({ success: false, error: "Error al validar respuestas" });

        if (isValid) {
            db.cambiarPassword(correo, nuevaPassword, (err, result) => {
                if (err) return res.status(500).send({ success: false, error: "Error al cambiar contraseña" });
                res.send({ success: true });
            });
        } else {
            res.send({ success: false });
        }
    });
});
router.post("/verificar-token", (req, res) => {
    const { token } = req.body;

    if (token === storedToken) {
        storedToken = null; // Limpiar el token tras la verificación
        return res.redirect("/index.html"); // Redirigir al index si es válido
    } else {
        return res.status(401).send("Token inválido");
    }
});
// Ruta para obtener los países (referencia NULL)
router.get('/api/ubicaciones/paises', (req, res) => {
    db.verpais((err, pais) => {
        if (err) {
            console.error("Error al obtener las consolas:", err);
            return res.status(500).json({ error: "Error al obtener consolas" });
        }
        res.json(pais);
    });
});
// Ruta para obtener las provincias según el país
router.get('/api/ubicaciones/provincias', (req, res) => {
    const paisId = req.query.paisId;  // Obtenemos el ID del país desde la query string
    if (!paisId) {
        return res.status(400).send('paisId es requerido');
    }

    db.verpro(paisId, (err, result) => {
        if (err) {
            return res.status(500).send('Error al obtener las provincias');
        }
        res.json(result);  // Usamos 'result' ya que es el nombre devuelto en el callback
    });
});
// Ruta para obtener los cantones según la provincia
router.get('/api/ubicaciones/cantones', (req, res) => {
    const provinciaId = req.query.provinciaId;  // Obtenemos el ID del país desde la query string
    if (!provinciaId) {
        return res.status(400).send('paisId es requerido');
    }

    db.verCantones(provinciaId, (err, result) => {
        if (err) {
            return res.status(500).send('Error al obtener las provincias');
        }
        res.json(result);  // Usamos 'result' ya que es el nombre devuelto en el callback
    });
});
router.get('/api/ubicaciones/distritos', (req, res) => {
    const cantonId = req.query.cantonId;  // Obtenemos el ID del país desde la query string
    if (!cantonId) {
        return res.status(400).send('paisId es requerido');
    }

    db.verDistritos(cantonId, (err, result) => {
        if (err) {
            return res.status(500).send('Error al obtener las provincias');
        }
        res.json(result);  // Usamos 'result' ya que es el nombre devuelto en el callback
    });
});
router.get('/api/tipoCambio', async (req, res) => {
    const url = 'https://gee.bccr.fi.cr/indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx?WSDL';

    soap.createClient(url, (err, client) => {
        if (err) return res.status(500).send({ error: 'Error creando cliente SOAP' });

        const args = {
            Indicador: 317,
            FechaInicio: '18/11/2024',
            FechaFinal: '18/11/2024',
            Nombre: 'Dennis',
            SubNiveles: 'N',
            CorreoElectronico: 'sanchezvalderramosd@gmail.com',
            Token: 'V4A1R8SDCA'
        };

        client.ObtenerIndicadoresEconomicosXML(args, (err, result) => {
            if (err) return res.status(500).send({ error: 'Error obteniendo el tipo de cambio' });

            const xmlResult = result.ObtenerIndicadoresEconomicosXMLResult;


            xml2js.parseString(xmlResult, (err, jsonResult) => {
                if (err) return res.status(500).send({ error: 'Error procesando XML' });


                res.send(jsonResult);
            });
        });
    });
});
router.get('/api/paypal', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.headers["Prefer"] = "return=representation";
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
            amount: {
                currency_code: "USD",
                value: "10.00"
            }
        }],
        application_context: {
            return_url: "http://localhost:3300/api/paypal/return",
            cancel_url: "http://localhost:3300/api/paypal/cancel"
        }
    });

    try {
        const order = await client.execute(request);
        res.json({ approval_url: order.result.links.find(link => link.rel === 'approve').href });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating PayPal order');
    }
});
router.get('/api/paypal/return', async (req, res) => {
    const orderId = req.query.token;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);

    try {
        const capture = await client.execute(request);
        res.send(`Pago realizado con éxito! `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al capturar el pago');
    }
});
router.get('/api/paypal/cancel', (req, res) => {
    res.send('El pago fue cancelado.');
});

module.exports = router;
