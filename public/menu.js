(function() {
    var menutrigger = document.getElementById("menutrigger");
    var usermenu = document.getElementById("usermenu");
    var menucloser = document.getElementById("menucloser");

    menutrigger.addEventListener("click", function() {
        usermenu.classList.add("on");
    });
    menucloser.addEventListener("click", function() {
        console.log("closing");
        usermenu.classList.remove("on");
    });
})();
