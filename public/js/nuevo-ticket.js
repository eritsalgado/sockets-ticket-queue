// Referencias del HTML
const lblNuevoTicket    = document.querySelector('#lblNuevoTicket')
const btnCrear          = document.querySelector('#btnNuevoTicket')

const socket = io();



socket.on('connect', () => {
    btnCrear.disabled = false
});

socket.on('disconnect', () => {
    btnCrear.disabled = true
});


socket.on('ultimo-ticket', (ultimo_ticket) => {
    lblNuevoTicket.innerText = `Ultimo turno de cliente: ${ultimo_ticket}`
});

btnCrear.addEventListener( 'click', () => {
    socket.emit( 'siguiente-ticket', null, ( ticket ) => {
        lblNuevoTicket.innerText = ticket
    });

});