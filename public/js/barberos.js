// Referencias del HTML
const input_barbero = $('#nombre_barbero')
const btn_crear      = $('#btn_agregar_barbero')

const socket = io();

input_barbero.focus()


socket.on('connect', () => {
    btn_crear.removeClass( "disabled");
});

socket.on('disconnect', () => {
    btn_crear.addClass( "disabled");
});


socket.on('nuevo-barbero-registrado', (barbero) => {
    crear_elemento_barbero(barbero)
});

btn_crear.click( () => {
    const nombre = input_barbero.val()
    if (nombre.trim() == '') {
        swal(
            "Oye!", 
            `No has escrito el nombre, es necesario para agregar un barbero a la lista publica!`, 
            "error"
        );
        input_barbero.val('')
        return
    }
    socket.emit( 'nuevo-barbero', {nombre}, ( barbero ) => {
        const primer_nombre = barbero.nombre.split(' ')[0]
        swal(
            "Genial!", 
            `Se registró ${primer_nombre} como barbero el día de hoy`, 
            "success"
        );

        input_barbero.val('')
        input_barbero.focus()
    });

});


$(document.body).on('click', '.atender_siguiente' ,function(e){
    e.preventDefault()
    const barbero = $(this).data('barbero-id')
    const cliente_del_barbero = $(`#cliente_del_barbero_${barbero}`)
    socket.emit( 'atender-cliente', {barbero}, ( {ok, cliente, msg, id_barbero} ) => {

        console.log(ok)
        
        // Si no hay nuevo cliente, se termino la cola
        if( !ok ){
            cliente_del_barbero.html( 'Disponible' )
            swal(
                "¡Genial!", 
                `Ese fue el ultimo cliente esperando, pronto vendrán mas.`, 
                "success"
            );
            return
        }
        cliente_del_barbero.html( cliente.nombre )

    });
})

$(document.body).on('click', '.terminar_servicio' ,function(e){
    e.preventDefault()
    const barbero = $(this).data('barbero-id')
    
    if($(`#cliente_del_barbero_${barbero}`).html().trim() != ''){
        swal(
            "El barbero aún está atendiendo a un cliente", 
            `¿Deseas terminar el servicio y retirar al barbero de la pantalla? Puedes agregarlo más tarde sin problemas.`, 
            "warning"
        )
        .then((retirar) => {
            if (retirar) {
                retirar_barbero(barbero)
                swal("El barbero se retiró de la pantalla.", {
                    icon: "success",
                });
            } else {
                swal("No se realizó ningun cambio");
            }
        })
    }else{
        swal(
            "¿Quieres de retirar al barbero de la pantalla?", 
            `Puedes agregarlo más tarde sin problemas.`, 
            "warning"
        )
        .then((retirar) => {
            if (retirar) {
                retirar_barbero(barbero)
                swal("El barbero se retiró de la pantalla.", {
                    icon: "success",
                });
            } else {
                swal("No se realizó ningun cambio");
            }
        })
    }
})


function crear_elemento_barbero(barbero){
    let cliente     = barbero.cliente != null ? barbero.cliente.nombre : 'Disponible'

    const html = `
        <tr id="tr_barbero_${barbero.id}">
            <td>${barbero.nombre}</td>
            <td id="cliente_del_barbero_${barbero.id}">${cliente}</td>
            <td colspan="2">
                <button class="btn btn-success atender_siguiente" data-barbero-id="${barbero.id}">
                    <i class="far fa-thumbs-up"></i>
                </button>
                <button class="btn btn-danger terminar_servicio" data-barbero-id="${barbero.id}">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </td>
        </tr>
    `

    $('#barberos').append(html)
}

function retirar_barbero(barbero){
    socket.emit( 'retirar-barbero', {barbero}, ( id_a_eliminar ) => {

        $(`#tr_barbero_${id_a_eliminar}`).remove()

    });
}







// ****************************************************************************************************************
// **************************** Se ejecuta solamente cuando la web cargó completamente ****************************
// ****************************************************************************************************************

$( document ).ready(function() {
    socket.emit('obtener-barberos', null, ( barberos ) => {
        // Se obtienen los barberos existentes esperando
        // Por cada barbero, renderizar a la pantalla
        barberos.forEach(barbero => {
            crear_elemento_barbero(barbero)
        });
    })
})