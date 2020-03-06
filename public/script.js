(function() {
    ticker("ticker1");
    setTimeout(function() {
        ticker("ticker2");
    }, 2000);
    setTimeout(function() {
        ticker("ticker3");
    }, 4000);
    setTimeout(function() {
        ticker("ticker4");
    }, 6000);
    setTimeout(function() {
        ticker("ticker5");
    }, 8000);
    setTimeout(function() {
        ticker("ticker6");
    }, 10000);
    setTimeout(function() {
        ticker("ticker7");
    }, 12000);
    setTimeout(function() {
        ticker("ticker8");
    }, 14000);
    setTimeout(function() {
        ticker("ticker9");
    }, 16000);

    function ticker(element) {
        console.log("move ticker", element);
        var ticker = document.getElementById(element);
        var headlines = ticker.querySelector(".headlines");
        var links = headlines.getElementsByTagName("a");
        var left = headlines.offsetLeft;
        var animId;

        headlines.addEventListener("mouseenter", function() {
            cancelAnimationFrame(animId);
        });

        headlines.addEventListener("mouseleave", function() {
            moveHeadLines();
        });

        moveHeadLines();

        function moveHeadLines() {
            left--;
            if (left <= -links[0].offsetWidth) {
                left += links[0].offsetWidth;
                headlines.appendChild(links[0]);
            }
            headlines.style.left = left + "px";
            animId = requestAnimationFrame(moveHeadLines);
        }
    }
})();
