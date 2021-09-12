// Referencias del HTML
const input_cliente = $('#nombre_cliente')
const btnCrear      = $('#btn_agregar_cliente')

const socket = io();

input_cliente.focus()


socket.on('connect', () => {
    btnCrear.removeClass( "disabled");
});

socket.on('disconnect', () => {
    btnCrear.addClass( "disabled");
});


socket.on('ultimo-ticket', (ultimo_ticket) => {
    // lblNuevoTicket.innerText = `Ultimo turno de cliente: ${ultimo_ticket}`
});

btnCrear.click( () => {
    const nombre = input_cliente.val()
    if (nombre.trim() == '') {
        swal(
            "Oye!", 
            `No has escrito tu nombre, es necesario para agregarte a la lista de espera!`, 
            "error"
        );
        input_cliente.val('')
        return
    }
    socket.emit( 'nuevo-cliente', {nombre}, ( ticket ) => {
        const primer_nombre = ticket.nombre.split(' ')[0]
        swal(
            "Genial!", 
            `${primer_nombre} ya estás en la lista de espera, puedes pasar a la sala`, 
            "success"
        );

        input_cliente.val('')
        input_cliente.focus()
    });

});