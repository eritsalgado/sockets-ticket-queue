$('#nuevo-elemento').click(()=> {
    let id = Date.now()
    let html = `    
        <div class="card barbero show" id="barber-${id}">
            <div class="card-header">
                Jhon Doe
            </div>
            <div class="card-body">
                <img src="./assets/img/iconos/barber-2.png" alt="" class="img-fluid">
            </div>
            <div class="card-footer">
                <p>ATENDIENDO A:</p>
                <p 
                    class="nombre-cliente"
                    id="nombre_cliente_1"
                >
                    Alvaro Gutierrez
                </p>
            </div>
        </div>
    `
    $('#barber-spot').append(html)
    // setTimeout(() => {
    //     $(`#test-element-${id}`).toggleClass('show')
    // }, 100);
})

function disposeBarber(id) {
    $(`#barber-${id}`).removeClass('show')
    $(`#barber-${id}`).addClass('hide')
    setTimeout(() => {
        $(`#barber-${id}`).remove()
    }, 1500);
}