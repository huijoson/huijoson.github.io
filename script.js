
// 添加照片載入時的漸入效果
window.addEventListener('load', () => {
    const photo = document.querySelector('.main-photo');
    photo.style.opacity = 0;
    photo.style.transition = 'opacity 1s ease-in';
    setTimeout(() => {
        photo.style.opacity = 1;
    }, 500);
});

window.addEventListener('load', function() {
    const qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "https://huijoson.github.io/",
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}); 