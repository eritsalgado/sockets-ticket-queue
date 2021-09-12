const TicketControl = require("../models/ticket-control")

const ticketControl = new TicketControl()


const socketController = (socket) => {

    // Cuando un cliente se conecta
    socket.emit('ultimo-ticket', ticketControl.ultimo)
    socket.emit('estado-actual', ticketControl.ultimos5)
    socket.emit('tickets-pendientes', ticketControl.tickets.length)

    socket.on('nuevo-cliente', ( {nombre}, callback ) => {
        
        const cliente = ticketControl.nuevo_cliente(nombre)
        callback(cliente)
        socket.broadcast.emit('tickets-pendientes', ticketControl.tickets.length)
        socket.broadcast.emit('nuevo-cliente-registrado', cliente)

    })
    socket.on('nuevo-barbero', ( {nombre}, callback ) => {
        
        const barbero = ticketControl.nuevo_barbero(nombre)
        callback(barbero)
        socket.emit('nuevo-barbero-registrado', barbero)
        socket.broadcast.emit('nuevo-barbero-registrado', barbero)

    })

    socket.on('obtener-ultimo-ticket', ( payload, callback ) => {
        callback(ticketControl.ultimo)
    })

    socket.on('obtener-clientes-esperando', ( payload, callback ) => {
        callback(ticketControl.tickets)
    })
    socket.on('obtener-barberos', ( payload, callback ) => {
        callback(ticketControl.barberos)
    })

    socket.on('atender-cliente', ({barbero}, callback) => {
        if(!barbero){
            return callback({
                ok:false,
                msg:'El barbero es obligatorio'
            })
        }

        const cliente = ticketControl.atenderTicket( barbero )

        //Notificar cambio en los ultimos 5 tickets
        
        // socket.broadcast.emit('estado-actual', ticketControl.ultimos5)
        // socket.emit('tickets-pendientes', ticketControl.tickets.length)
        // socket.broadcast.emit('tickets-pendientes', ticketControl.tickets.length)
        const response = {
            id:         !cliente ? null : cliente.numero,
            nombre:     !cliente ? null : cliente.nombre,
            barbero
        }

        socket.emit('atendiendo-nuevo-cliente', response)
        socket.broadcast.emit('atendiendo-nuevo-cliente', response)

        if ( !cliente ) {
            callback({
                ok:false,
                msg:'No hay más clientes esperando'
            })
        }else{
            callback({
                ok:true,
                msg:'Siguiente cliente' + cliente.nombre,
                cliente,
                id_barbero:barbero
            })
        }

    })

    socket.on('retirar-barbero', ({barbero}, callback) => {
        
        const barbero_eliminado = ticketControl.terminar_servicio( barbero )

        socket.emit('barbero_eliminado', barbero_eliminado)
        socket.broadcast.emit('barbero_eliminado', barbero_eliminado)

        return callback(barbero_eliminado)

    })

}



module.exports = {
    socketController
}

