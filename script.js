document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('heartCanvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        
        var offsetX = canvas.width / 2;
        var offsetY = canvas.height / 2 - 20;
        var scale = 10; // Change the size of the heart here

        // Heart parameters
        var topCurveHeight = scale * 3.5;
        var verticalHeartHeight = scale * 2.5;
        var horizontalHeartWidth = scale * 2.5;
        var bottomCurveHeight = scale * 2.5;

        ctx.beginPath();
        // Start at bottom of heart
        ctx.moveTo(offsetX, offsetY + verticalHeartHeight);
        
        // Draw top left curve
        ctx.bezierCurveTo(
            offsetX, offsetY + verticalHeartHeight - topCurveHeight,
            offsetX - horizontalHeartWidth, offsetY + verticalHeartHeight - topCurveHeight,
            offsetX - horizontalHeartWidth, offsetY
        );

        // Draw bottom left curve
        ctx.bezierCurveTo(
            offsetX - horizontalHeartWidth, offsetY - bottomCurveHeight,
            offsetX, offsetY - bottomCurveHeight - topCurveHeight,
            offsetX, offsetY
        );

        // Draw bottom right curve
        ctx.bezierCurveTo(
            offsetX, offsetY - bottomCurveHeight - topCurveHeight,
            offsetX + horizontalHeartWidth, offsetY - bottomCurveHeight,
            offsetX + horizontalHeartWidth, offsetY
        );

        // Draw top right curve
        ctx.bezierCurveTo(
            offsetX + horizontalHeartWidth, offsetY + verticalHeartHeight - topCurveHeight,
            offsetX, offsetY + verticalHeartHeight - topCurveHeight,
            offsetX, offsetY + verticalHeartHeight
        );
        
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        // Add animated message
        var message = "詠萱2024依然愛妳";
        var messageOffsetY = offsetY + scale * 6;
        ctx.font = '22px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        // Animate the message
        var opacity = 1;
        var fadeIn = true;
        setInterval(function() {
            ctx.clearRect(0, messageOffsetY - 30, canvas.width, 100); // Clear the old text
            ctx.globalAlpha = opacity;
            ctx.fillText(message, offsetX, messageOffsetY); // Draw new text

            // Update the opacity for fade in/out effect
            if (fadeIn) {
                opacity -= 0.01;
                if (opacity <= 0) fadeIn = false;
            } else {
                opacity += 0.01;
                if (opacity >= 1) fadeIn = true;
            }
        }, 50);
    }
});
