const   socket              = io()
let     clientes_en_espera  = 0
let     barberos_disponibles= []

const footer_barbero = (cliente) =>  {
    let html = ''

    if(cliente != null){
        html = `
            <p>ATENDIENDO A:</p>
            <p 
                class="nombre-cliente"
                id="${cliente.id}"
            >
                ${cliente.nombre}
            </p>
        `
    }else{
        html =`
            <h1 class="text-center">DISPONIBLE</h1>
        `
    }

    return html
}

socket.on('nuevo-cliente-registrado', (nuevo_cliente) => {
    renderizar_cliente(nuevo_cliente)
    clientes_en_espera += 1
    actualizar_clientes_en_espera(clientes_en_espera)
});

socket.on('nuevo-barbero-registrado', (barbero) => {
    barberos_disponibles.push( barbero )
    renderizar_barbero(barbero)
})

socket.on('atendiendo-nuevo-cliente', ( cliente ) => {
    if (!cliente.id) {
        $(`#footer_barbero_${cliente.barbero}`).html(footer_barbero(null))
        return
    }
    const {barbero, id} = cliente
    // Iniciar Sonido

    const audio = new Audio('./audio/new-ticket.mp3')
    audio.play()

    // Ocultar y destruir elemento de cliente y subirlo al barbero que lo atiende
    $(`#cliente_${id}`).removeClass('show')
    $(`#cliente_${id}`).addClass('hide')

    setTimeout(() => {
        $(`#cliente_${id}`).remove()
    }, 1000);

    $(`#footer_barbero_${barbero}`).html(footer_barbero(cliente))
    clientes_en_espera -= 1
    actualizar_clientes_en_espera(clientes_en_espera)
})

socket.on('barbero_eliminado', (barbero) => {
    const barberos_filtrados = barberos_disponibles.filter(function(barbero) {
        return barbero.id != id_barbero; 
    });

    barberos_disponibles = barberos_filtrados

    $(`#${barbero}`).removeClass('show')
    $(`#${barbero}`).addClass('hide')
    setTimeout(() => {
        $(`#${barbero}`).remove()
    }, 2000);
})

function renderizar_barbero(barbero){
    const html = `
        <div id="${barbero.id}" class="card barbero show">
            <div class="card-header">
                ${barbero.nombre}
            </div>
            <div class="card-body text-center">
                <img src="./assets/img/iconos/barber-2.png" alt="" class="img-fluid">
            </div>
            <div class="card-footer" id="footer_barbero_${barbero.id}">
                ${footer_barbero(barbero.cliente)}
            </div>
        </div>
    `
    $('#barber-spot').append(html)
}
function actualizar_clientes_en_espera(clientes_en_espera){
    $('#clientes_en_espera').html(clientes_en_espera)
}

function renderizar_cliente(cliente){
    const icono_cliente = Math.floor(Math.random() * (10 - 1) + 1)

    const barbero = cliente.barbero != null ? barberos_disponibles.filter(function(barbero) {
        return barbero.id == cliente.barbero
    }) : null

    const html = `
        <div 
            id="cliente_${cliente.numero}"
            class="cliente-esperando d-inline-block show"
        >
            <div class="row">
                <div class="d-flex justify-content-center align-items-center esperando">
                    <div class="client-icon">
                        <img src="./assets/img/iconos/${icono_cliente}.svg">
                    </div>
                    <div class="client-names-group">
                        <div class="client-name">
                            <span>${cliente.nombre}</span>
                        </div>
                        <div class="barber-name text-center" style="display:${cliente.barbero != null ? 'block':'none'}">
                            <span>Esperando a: ${barbero != null ? barbero[0].nombre : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
    setTimeout(() => {
        $('#client-spot').append(html)     
    }, 2500);
}

$( document ).ready(function() {
    socket.emit('obtener-clientes-esperando', null, ( clientes ) => {
        // Se obtienen los clientes existentes esperando

        // Se publica cuantos estan esperando actualmente
        clientes_en_espera = clientes.length
        actualizar_clientes_en_espera(clientes_en_espera)

        // Por cada cliente, renderizar a la pantalla
        // Esperar 2 sec
        setTimeout(() => {
            clientes.forEach(cliente => {
                renderizar_cliente(cliente)
            });
        }, 2000);
    })
    socket.emit('obtener-barberos', null, ( barberos ) => {
        barberos_disponibles = barberos
        // Se obtienen los clientes existentes esperando
        let html = ''
        // Por cada cliente, renderizar a la pantalla
        barberos.forEach(barbero => {
            renderizar_barbero(barbero)
        });
    })
});