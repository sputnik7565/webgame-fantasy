export class BackgroundManager {
    constructor() {
        this.body = document.body;
    }

    setBackground(imagePath) {
        this.body.style.backgroundImage = `url(${imagePath})`;
        this.body.style.backgroundSize = 'cover';
        this.body.style.backgroundPosition = 'center';
        this.body.style.backgroundRepeat = 'no-repeat';
        this.body.style.backgroundAttachment = 'fixed'; // 스크롤 시 배경 고정
    }

    fadeToNewBackground(imagePath, duration = 1000) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundImage = `url(${imagePath})`;
        overlay.style.backgroundSize = 'cover';
        overlay.style.backgroundPosition = 'center';
        overlay.style.backgroundRepeat = 'no-repeat';
        overlay.style.opacity = '0';
        overlay.style.transition = `opacity ${duration}ms ease-in-out`;
        overlay.style.zIndex = '-1'; // body 내용 뒤에 위치하도록 설정

        this.body.appendChild(overlay);

        // 강제로 리플로우를 발생시켜 트랜지션이 적용되게 함
        overlay.offsetHeight;

        overlay.style.opacity = '1';

        setTimeout(() => {
            this.setBackground(imagePath);
            this.body.removeChild(overlay);
        }, duration);
    }

    addVisualEffect(effectName, duration = 1000) {
        this.body.classList.add(effectName);
        setTimeout(() => {
            this.body.classList.remove(effectName);
        }, duration);
    }
}