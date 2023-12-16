document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('heartCanvas');
    var context = canvas.getContext('2d');
    
    // 繪製愛心
    function drawHeart() {
        context.beginPath();
        context.moveTo(150, 150);
        context.bezierCurveTo(150, 130, 130, 115, 100, 115);
        context.bezierCurveTo(50, 115, 50, 150, 50, 150);
        context.bezierCurveTo(50, 180, 80, 205, 150, 250);
        context.bezierCurveTo(220, 205, 250, 180, 250, 150);
        context.bezierCurveTo(250, 150, 250, 115, 200, 115);
        context.bezierCurveTo(175, 115, 150, 130, 150, 150);
        context.closePath();
        context.fillStyle = 'red';
        context.fill();
    }
    
    drawHeart();
});
