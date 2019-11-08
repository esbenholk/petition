(function() {
    var ctx = document.getElementById("signature").getContext("2d");
    var canvas = document.getElementById("signature");
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
    });

    canvas.addEventListener("mousemove", function(e) {
        lastX = x;
        lastY = y;
        if (mouseDown == true) {
            x = e.clientX - canvas.offsetLeft;
            y = e.clientY - canvas.offsetTop;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = "hotpink";
            ctx.stroke();
            ctx.closePath();
        }
    });
})();
