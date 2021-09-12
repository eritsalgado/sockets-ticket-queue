const socket = io();

const btn_reporte = $('#btn-reporte')

socket.on('connect', () => {
    btn_reporte.removeClass( "disabled" );
});

socket.on('disconnect', () => {
    btn_reporte.addClass( "disabled" );
});

btn_reporte.click((e) => {
    e.preventDefault()
    socket.emit('obtener-ultimo-ticket', null, ( ticket ) => {
        swal(
            "Reporte del día", 
            `Total de clientes: ${ticket}`, 
            "info"
        );
    })
})
