// Referencias del HTML
const lblEscritorio     = document.querySelector('#id_escritorio')
const btn_atender       = document.querySelector('#btn_atender')
const ticket_atendiendo = document.querySelector('#ticket_atendiendo')
const alerta            = document.querySelector('.alert')
const lblPendientes     = document.querySelector('#lblPendientes')

const searchParams = new URLSearchParams( window.location.search )

if( !searchParams.has('escritorio') ){
    window.location = 'index.html'
    throw new Error('El escritorio es obligatorio')
}

const escritorio = searchParams.get('escritorio')
const socket = io();

lblEscritorio.innerText = `${escritorio}`
alerta.style.display = 'none'

socket.on('connect', () => {
    btn_atender.disabled = false
});

socket.on('disconnect', () => {
    btn_atender.disabled = true
});


socket.on('ultimo-ticket', (ultimo_ticket) => {
    // lblNuevoTicket.innerText = `Ultimo ticket: ${ultimo_ticket}`
});


socket.on('tickets-pendientes', (tickets_pendientes) => {
    lblPendientes.innerText = tickets_pendientes
})

btn_atender.addEventListener( 'click', () => {
    socket.emit( 'atender-ticket', {escritorio}, ( {ok, ticket, msg} ) => {
        
        if( !ok ){
            ticket_atendiendo.innerText = 'Nadie'
            return alerta.style.display = ''
        }
        ticket_atendiendo.innerText = `Cliente no. ${ticket.numero}`
        alerta.style.display = 'none'
        

    });
});
