const path  =   require('path')
const fs    =   require('fs')

class Ticket {
    constructor(numero,escritorio,nombre){
        this.numero     = numero
        this.escritorio = escritorio
        this.nombre     = nombre
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
        this.ultimo     = 0;
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

    nuevo_cliente(nombre){
        this.ultimo += 1
        const ticket = new Ticket(this.ultimo, null, nombre)
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
            });
            return null
        }

        const cliente = this.tickets.shift()
        cliente.escritorio = id_barbero

        this.ultimos5.unshift( cliente )

        if(this.ultimos5.length > 5){
            this.ultimos5.splice(-1, 1)
        }

        this.barberos.forEach(barbero => {
            if(barbero.id == id_barbero){
                barbero.cliente = cliente
            }
        });
        
        this.guardarDB()

        return cliente
    }

    terminar_servicio( id_barbero ){
        
        const barberos_filtrados = this.barberos.filter(function(barbero) {
            return barbero.id != id_barbero; 
        });

        this.barberos = barberos_filtrados
        this.guardarDB()

        return id_barbero
    }

}


module.exports = TicketControl