const express = require('express')
const app = express()

const http = require ('http').Server(app);
const io = require ('socket.io')(http);

const ContenedorSql = require ('./contenedorsql.js')
const {options1} = require('./options/mariaDB');
const {options} = require( './options/SQLite3.js');

const sqlproductos = new ContenedorSql(options1)
const sqlmensajes = new ContenedorSql(options)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

sqlmensajes.crearTablaMensajes();

async function crear ( ){
    await sqlproductos.crearTablaProductos();
}
crear();

io.on('connection', async socket => {

    console.log('Nuevo cliente conectado!');

    socket.emit('productos', await sqlproductos.listarProductos());

    socket.on('update', async producto  => {
        await sqlproductos.insertarProducto(producto)
        io.sockets.emit('productos', await sqlproductos.listarProductos());
    })

    socket.emit('mensajes', await sqlmensajes.listarMensajes());

    socket.on('nuevoMensaje', async mensaje => {
        mensaje.fyh = new Date().toLocaleString()
        await sqlmensajes.insertarMensaje(mensaje)
        io.sockets.emit('mensajes', await sqlmensajes.listarMensajes());
    })
});

http.listen(8080, () => console.log('Servidor corriendo en puerto 8080...'));