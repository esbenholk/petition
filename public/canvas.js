(function() {
    var ctx = document.getElementById("signature").getContext("2d");
    var canvas = document.getElementById("signature");
    var secretsignature = document.getElementById("secretsignature");
    var submit = document.getElementById("submit");
    let canvasData;
    var mouseDown = false;
    var lastX, lastY;
    // const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;

    canvas.addEventListener("mousedown", function(e) {
        mouseDown = true;
        x = e.clientX - canvas.offsetLeft;
        y = e.clientY - canvas.offsetTop;
    });

    canvas.addEventListener("mouseup", function(e) {
        mouseDown = false;
        canvasData = canvas.toDataURL("image/png");
        secretsignature.value = canvasData;
        console.log(canvasData);
    });

    canvas.addEventListener("mousemove", function(e) {
        lastX = x;
        lastY = y;
        if (mouseDown == true) {
            x = e.clientX - canvas.offsetLeft;
            y = e.clientY - canvas.offsetTop;
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = "white";
            ctx.stroke();
            ctx.closePath();
        }
    });

    // submit.addEventListener("click", function(e) {
    //     console.log("button");
    //     let inputfields = document.getElementsByTagName("input");
    //     for (var i = 0; i < inputfields.length; i++) {
    //         if (inputfields[i].value == "" || inputfields[i].value == null) {
    //             inputfields[i].style.border = "2px pink";
    //         }
    //     }
    // });
})();
