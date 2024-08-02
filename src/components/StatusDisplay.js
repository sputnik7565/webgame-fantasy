import { HealthBar } from './HealthBar.js';

export class StatusDisplay {
    constructor(container, entity, options = {}) {
        this.container = container;
        this.entity = entity;
        this.options = {
            showImage: options.showImage || true,
            imageSize: options.imageSize || '80px',
            showName: options.showName || true,
            showLevel: options.showLevel || true,
            showStats: options.showStats || true,
            showHealthBar: options.showHealthBar || true,
            healthBarOptions: options.healthBarOptions || {}
        };
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        if (this.options.showImage && this.entity.image) {
            const img = document.createElement('img');
            img.src = this.entity.image;
            img.alt = `${this.entity.name} 이미지`;
            img.style.width = this.options.imageSize;
            img.style.height = this.options.imageSize;
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            this.container.appendChild(img);
        }

        const infoContainer = document.createElement('div');
        infoContainer.style.marginLeft = '10px';

        if (this.options.showName) {
            const nameElement = document.createElement('h3');
            nameElement.textContent = this.entity.name;
            infoContainer.appendChild(nameElement);
        }

        if (this.options.showLevel) {
            const levelElement = document.createElement('p');
            levelElement.textContent = `레벨: ${this.entity.level}`;
            infoContainer.appendChild(levelElement);
        }

        if (this.options.showStats) {
            const statsElement = document.createElement('p');
            statsElement.textContent = `공격력: ${this.entity.attack} | 방어력: ${this.entity.defense}`;
            infoContainer.appendChild(statsElement);
        }

        if (this.options.showHealthBar) {
            const healthBarContainer = document.createElement('div');
            this.healthBar = new HealthBar(
                this.entity.maxHp,
                this.entity.hp,
                healthBarContainer,
                this.options.healthBarOptions
            );
            infoContainer.appendChild(healthBarContainer);
        }

        this.container.appendChild(infoContainer);
    }

    update() {
        this.render();
    }
}