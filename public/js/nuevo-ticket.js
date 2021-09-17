// Referencias del HTML
const   input_cliente        = $('#nombre_cliente')
const   btnCrear             = $('#btn_agregar_cliente')
let     barberos_disponibles = []

const   socket               = io();

input_cliente.focus()


socket.on('connect', () => {
    btnCrear.removeClass( "disabled");

    socket.emit('obtener-barberos', null, ( barberos ) => {
        barberos_disponibles = barberos
    })
});

socket.on('disconnect', () => {
    btnCrear.addClass( "disabled");
});


socket.on('nuevo-barbero-registrado', (barbero) => {
    barberos_disponibles.push( barbero )
})

socket.on('barbero_eliminado', (id_barbero) => {
    const barberos_filtrados = barberos_disponibles.filter(function(barbero) {
        return barbero.id != id_barbero; 
    });

    barberos_disponibles = barberos_filtrados
})

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

    swal({
        title: "¿Quieres que un barbero especifico te atienda?",
        text: "Solo ese barbero te podrá atender",
        icon: "info",
        buttons: {
            cancel: "No, gracias",
            ok: {
                text: "Claro!",
                value: "ok",
            }
        },
    })
    .then((value) => {
        switch (value) {
       
          case "ok":
            // Generar objeto de barberos
            let buttons = {}
            buttons.cancel = "Cualquiera"

            barberos_disponibles.forEach(barbero => {
                buttons[`barbero_${barbero.id}`] = {
                    text:barbero.nombre,
                    value:barbero.id
                }
            });
            // Preguntar cual barbero
            swal({
                title: "Selecciona un barbero",
                text: "Solo el te podrá atender",
                icon: "warning",
                buttons,
            })
            .then((barbero) => {
                if(barbero == null){
                    // Cualquiera lo puede atender
                    agregar_cliente(nombre, null)
                }else{
                    agregar_cliente(nombre, barbero)
                }
            })
            break;
       
          default:
            // Agregar cliente sin barbero
            agregar_cliente(nombre, null)
        }
    });


});

function agregar_cliente(nombre, barbero){

    socket.emit( 'nuevo-cliente', {nombre, barbero}, ( ticket ) => {
        const primer_nombre = ticket.nombre.split(' ')[0]
        console.log(ticket)
        swal(
            "Genial!", 
            `${primer_nombre} ya estás en la lista de espera, puedes pasar a la sala`, 
            "success"
        );

        input_cliente.val('')
        input_cliente.focus()
    });

}