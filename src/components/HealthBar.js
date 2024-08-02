export class HealthBar {
    constructor(maxHealth, currentHealth, container, options = {}) {
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.container = container;
        this.options = {
            width: options.width || '100%',
            height: options.height || '10px',
            backgroundColor: options.backgroundColor || '#555',
            fillColor: options.fillColor || '#ff3333',
            borderRadius: options.borderRadius || '5px',
            showText: options.showText || false,
            textColor: options.textColor || '#fff'
        };
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.container.style.width = this.options.width;
        this.container.style.height = this.options.height;
        this.container.style.backgroundColor = this.options.backgroundColor;
        this.container.style.borderRadius = this.options.borderRadius;
        this.container.style.overflow = 'hidden';

        this.fillElement = document.createElement('div');
        this.fillElement.style.width = `${(this.currentHealth / this.maxHealth) * 100}%`;
        this.fillElement.style.height = '100%';
        this.fillElement.style.backgroundColor = this.options.fillColor;
        this.fillElement.style.transition = 'width 0.3s ease-in-out';

        this.container.appendChild(this.fillElement);

        if (this.options.showText) {
            this.textElement = document.createElement('div');
            this.textElement.style.position = 'absolute';
            this.textElement.style.width = '100%';
            this.textElement.style.textAlign = 'center';
            this.textElement.style.color = this.options.textColor;
            this.textElement.textContent = `${this.currentHealth} / ${this.maxHealth}`;
            this.container.appendChild(this.textElement);
        }
    }

    update(currentHealth) {
        this.currentHealth = currentHealth;
        this.fillElement.style.width = `${(this.currentHealth / this.maxHealth) * 100}%`;
        if (this.options.showText) {
            this.textElement.textContent = `${this.currentHealth} / ${this.maxHealth}`;
        }
    }
}