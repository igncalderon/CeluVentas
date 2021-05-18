
/*  Paquetes instalados: -g nodemon, express, express-handlebars, body-parser, mysql2
    Agregado al archivo "package.json" la línea --> "start": "nodemon index"
*/
//Cargo librerías instaladas y necesarias
const express = require('express'); //Para el manejo del servidor Web
const exphbs  = require('express-handlebars'); //Para el manejo de los HTML
const bodyParser = require('body-parser'); //Para el manejo de los strings JSON
var session = require('express-session');//Para el uso de las sesiones
var nodemailer = require('nodemailer');//para enviar emails


const app = express(); //Inicializo express para el manejo de las peticiones

var MySQL = require('./modulos/mysql'); //Añado el archivo mysql.js presente en la carpeta módulos
app.use(session({secret: '123456', resave: true, saveUninitialized: true}));
app.use(express.static('public')); //Expongo al lado cliente la carpeta "public"

app.use(bodyParser.urlencoded({ extended: false })); //Inicializo el parser JSON
app.use(bodyParser.json());

app.engine('handlebars', exphbs({defaultLayout: 'main'})); //Inicializo Handlebars. Utilizo como base el layout "Main".
app.set('view engine', 'handlebars'); //Inicializo Handlebars

const Listen_Port = 3000; //Puerto por el que estoy ejecutando la página Web

app.listen(Listen_Port, function() {
    console.log('Servidor NodeJS corriendo en http://localhost:' + Listen_Port + '/');
});


//3 tablas: Usuarios, Compras, Modelos. Distintas pantallas que se renderizan cuando apretamos los botones del header. No hay codigo de copiar y pegar, para eso usamos el each
//en todos los casos(esto hace que si agregamos un producto a la base de datos, se agrega automaticamente a la pagina sin tener que modificar el codigo). Pudimos arreglar lo del mail,
//tuvimos que usar el servidor de hotmail poque el de gmail nos tiraba error. Le agregamos varias pantallas al anteproyecto porque nos quedabamos cortos sino. Instalamos dos librerias:
// nodemailer y express-session. Para comprar tenes que iniciar sesion, porque sino el boton de comprar no aparece, sino que te dirige a iniciar sesion. Para la estetica usamos Boostrap y Boostsnip.
// el miercoles si tienen alguna duda, les explicamos si quieren. Suerte, espero que les guste la pagina xdd.

app.get("/pantallasamsung", async function (req,res){
    let sql = "SELECT * FROM Modelos Where Marca='Samsung'";
    let modelossamsung = await MySQL.Realizar_Query(sql);
    
    res.render("Samsung", {'usuario': req.session.usuario, "modelos":modelossamsung} );
});
app.get("/pantallaiphone", async function(req,res){
    let sql = "Select * from Modelos Where Marca='iPhone'";
    let modelosiphone = await MySQL.Realizar_Query(sql)

    res.render("Iphone",{'usuario': req.session.usuario, "modelos":modelosiphone});
});
app.get("/Contactenos", async function (req,res){
    res.render("Contacto", {'usuario': req.session.usuario});
});

app.get('/', async function(req, res){
    let sql = "SELECT * FROM Modelos limit 9";

    let modelos = await MySQL.Realizar_Query(sql);

    
    res.render('home', {'usuario': req.session.usuario, 'modelos': modelos} ); 
});

app.get("/login", function(req,res){
   
    res.render('LogIn', {'usuario': req.session.usuario}); 
});

app.post("/login", async function(req,res){
   
    let sql = "SELECT * FROM Usuarios where Nombre = '"+req.body.usuario+"' and Contrasena = '"+req.body.contrasena+"'";
    let rta = await MySQL.Realizar_Query(sql);

    if(rta.length > 0){
        req.session.usuario = req.body.usuario;
        req.session.userid = rta[0].ID;
        res.redirect('/');
    }else{
        res.render('LogIn', {error: "Usuario o contraseña incorrectos" } );
    }
});

app.get("/registrar", function(req,res){
   
    res.render("Registrar", null);
});

app.get("/compras-usuario/:idTelefono", async function(req,res){
    var datetime = new Date();
    let sql = "INSERT into Compras values ('"+req.session.userid+"','"+req.params.idTelefono+"')";
    let rta = await MySQL.Realizar_Query(sql);
    var error = false;
    if(rta.length > 0){
         error = false;
    }else{
         error = true;
    }
    
res.render("CompraGracias", {'usuario': req.session.usuario, 'error': error});
});

app.post("/registrar", async function(req,res){

    let sql = "SELECT * FROM Usuarios where Nombre = '"+req.body.nombre+"'";
    let rta = await MySQL.Realizar_Query(sql);

    if(rta.length > 0){
        res.render('Registrar', {error: "El usuario '"+req.body.nombre+"' ya existe" } );
    }else{
     let query = "INSERT INTO Usuarios values (0, '"+req.body.nombre+"','"+req.body.contrasena+"','"+req.body.email+"','"+req.body.edad+"')";
     await MySQL.Realizar_Query(query);
     res.render('Registrar', {exito: "El usuario fue registrado" } );
    }
});

app.get('/cerrarsesion', function(req,res){
    req.session.usuario = null;

res.redirect("/")
});
app.get("/comprar/:idTelefono", async function(req,res){
    let sql = "SELECT * FROM Modelos where ID="+req.params.idTelefono;
    let telefono = await MySQL.Realizar_Query(sql);
    console.log(req.params.idTelefono);

   
    res.render("Checkout", {'usuario': req.session.usuario, 'telefono': telefono[0] });
});

app.get("/telefono/:idTelefono", async function(req,res){
    
    var sql = "SELECT * FROM Modelos where ID="+req.params.idTelefono;
    var telefono = await MySQL.Realizar_Query(sql);

    sql = "select count(IDmodelo) as cantidad from Compras where IDmodelo ="+req.params.idTelefono;
    var cantidadVendidos = await MySQL.Realizar_Query(sql);

    
   
    res.render("telefono", {'usuario': req.session.usuario, 'telefono': telefono[0], 'cantidadVendidos': cantidadVendidos[0].cantidad });
    
});


app.get("/registrarselogin", function(req,res){
    res.redirect("Registrar");
});

app.get('/compras', async function(req, res){
    var resultado = [];
    var sql = 'select * from Compras where IDusuario = '+ req.session.userid;

    let compras = await MySQL.Realizar_Query(sql);

    for(var i = 0; i < compras.length;i++){
        sql = 'select * from Modelos where ID = '+ compras[i].IDmodelo + ';';
        console.log(sql);
        let modelo = await MySQL.Realizar_Query(sql);

        resultado.push({
            'Marca': modelo[i].Marca,
            'Modelo': modelo[i].Modelo,
            'Imagen': modelo[i].Imagen,
            'Color': modelo[i].Color,
            'Capacidad': modelo[i].Capacidad,
            'Precio': modelo[i].Precio,
        })
    }
 
    
    res.render('MisCompras', {'usuario': req.session.usuario,'resultado': resultado} ); //Renderizo página "home" sin pasar ningún objeto a Handlebars
});

app.post("/contactar", async function(req,res){

    let transport = nodemailer.createTransport({
        host: 'smtp.live.com',
        port: 25,
            secure: false,
            
        auth: {
           user: 'ignaciocalderon2301@hotmail.com',
           pass: 'iguicalderon2001'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const message = {
        from: 'ignaciocalderon2301@hotmail.com', // Sender address
        to: req.body.email,         // List of recipients
        subject: 'Cliente se quiere contactar', // Subject line
        text: 'El usuario con email: '+req.body.email+' - nombre: '+req.body.nombre+' - consulta: '+ req.body.consulta+ ' dejó sus datos en el formulario' // Plain text body
    };
    var rta =  transport.sendMail(message, function(err, info) {
        if (err) {
            console.log(err)
        } else {
           console.log('success')
        }
    });
    
    res.render("Contacto", {'usuario': req.session.usuario,'texto': 'En instantes nos comunicaremos con usted'});
});
app.get("/volver", function(req,res){
    res.redirect("/")
});
