const path  =   require('path')
const fs    =   require('fs')

class Ticket {
    constructor(numero, escritorio, nombre, barbero){
        this.numero     = numero
        this.escritorio = escritorio
        this.nombre     = nombre
        this.barbero    = barbero
    }
}

class Barbero {
    constructor(id,cliente,nombre){
        this.id     = id
        this.cliente = cliente
        this.nombre     = nombre
    }
}

class TicketControl {

    constructor(){
        this.ultimo     = 0
        this.hoy        = new Date().getDate()
        this.tickets    = []
        this.ultimos5   = []
        this.barberos   = []

        this.init()
    }

    get toJSON(){
        return {
            ultimo: this.ultimo,
            hoy: this.hoy,
            tickets: this.tickets,
            ultimos5: this.ultimos5,
            barberos: this.barberos
        }
    }

    init(){
        const {hoy, tickets, ultimos5, ultimo, barberos} = require("../db/data.json")
        if( hoy === this.hoy ){
            this.tickets    =   tickets
            this.ultimo     =   ultimo
            this.ultimos5   =   ultimos5
            this.barberos   =   barberos
        }else{
            this.guardarDB()
        }
    }

    guardarDB(){
        const dbPath =   path.join( __dirname, '../db/data.json' )
        fs.writeFileSync( dbPath, JSON.stringify( this.toJSON ) )
    }

    nuevo_cliente(nombre, barbero){
        this.ultimo += 1
        const ticket = new Ticket(this.ultimo, null, nombre, barbero)
        this.tickets.push(ticket)

        this.guardarDB()

        return ticket
    }

    nuevo_barbero(nombre){
        const barbero = new Barbero(Date.now(), null, nombre)
        this.barberos.push(barbero)

        this.guardarDB()

        return barbero
    }

    atenderTicket( id_barbero ){
        //No tenemos tickets
        if( this.tickets.length === 0 ){
            this.barberos.forEach(barbero => {
                if(barbero.id == id_barbero){
                    barbero.cliente = null
                }
            })
            return null
        }

        let cliente = {
            "numero":0,
            "escritorio":null,
            "nombre":"",
            "barbero":null
        }

        // Verificar siguientes hasta que:
        // 1. coincida con el id de barbero reservado
        // 2. no se haya reservado a ningun barbero
        // 3. se termine la lista
        cliente = this.verificar_barbero_en_siguiente_ticket(id_barbero)
        if(cliente === null){
            return null
        }
        
        cliente.escritorio = id_barbero

        this.ultimos5.unshift( cliente )

        if(this.ultimos5.length > 5){
            this.ultimos5.splice(-1, 1)
        }

        this.barberos.forEach(barbero => {
            if(barbero.id == id_barbero){
                barbero.cliente = cliente
            }
        })
        
        this.guardarDB()

        return cliente
    }

    verificar_barbero_en_siguiente_ticket(id_barbero){
        let found               = false
        let ticket_encontrado   = null
        let index_encontrado    = 0

        this.tickets.every((ticket, index) => {
            if(ticket.barbero == id_barbero || ticket.barbero == null){
                // Si el barbero del ticket siguiente es identico al id a revisar o nulo
                // retornar este objeto
                found = true
                ticket_encontrado = ticket
                index_encontrado = index

                return false
            }
            return true
        })

        // Si se encontro algo, eliminar el ticket de la lista de tickets
        // Y devolver el nuevo ticket al flujo principal
        if(found){
            this.tickets.splice(index_encontrado,1)
        }

        return ticket_encontrado
    }

    terminar_servicio( id_barbero ){
        
        const barberos_filtrados = this.barberos.filter(function(barbero) {
            return barbero.id != id_barbero
        })

        this.barberos = barberos_filtrados
        this.guardarDB()

        return id_barbero
    }

}


module.exports = TicketControl