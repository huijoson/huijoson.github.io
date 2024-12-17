function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = '❅';
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
    snowflake.style.opacity = Math.random();
    snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
    
    document.querySelector('.snow-container').appendChild(snowflake);
    
    setTimeout(() => {
        snowflake.remove();
    }, 5000);
}

setInterval(createSnowflake, 100);

// 添加照片載入時的漸入效果
window.addEventListener('load', () => {
    const photo = document.querySelector('.main-photo');
    photo.style.opacity = 0;
    photo.style.transition = 'opacity 1s ease-in';
    setTimeout(() => {
        photo.style.opacity = 1;
    }, 500);
}); 