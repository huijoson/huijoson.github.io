document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('heartCanvas');
    var context = canvas.getContext('2d');

    context.beginPath();
    var x = 150; // x 坐標
    var y = 150; // y 坐標
    var radius = 100; // 圓的半徑
    var startAngle = 0; // 開始點
    var endAngle = Math.PI + (Math.PI * 0.8) / 2; // 結束點
    var rotation = 0; // 旋轉角度

    context.arc(x, y, radius, startAngle, endAngle, false);
    context.arc(x + 190, y, radius, startAngle, endAngle, false);
    context.lineTo(x + 95, y + 280);
    context.closePath();
    context.fillStyle = 'red';
    context.fill();
});
