export class EventManager {
    constructor(eventData, logManager) {
        this.events = eventData.events;
        this.logManager = logManager;
    }

    triggerRandomEvent(player) {
        const totalProbability = this.events.reduce((sum, event) => sum + event.probability, 0);
        const randomValue = Math.random() * totalProbability;
        
        let cumulativeProbability = 0;
        for (const event of this.events) {
            cumulativeProbability += event.probability;
            if (randomValue <= cumulativeProbability) {
                this.executeEvent(event, player);
                break;
            }
        }
        if (Math.random() < 0.1) { // 10% 확률로 드래곤의 분노 획득
            this.handleDragonRageEvent(player);
        }
    }

    handleDragonRageEvent(player) {
        const rageGained = Math.floor(Math.random() * 3) + 1; // 1~3 랜덤 획득
        player.dragonRage += rageGained;
        this.logManager.log(`드래곤의 분노를 ${rageGained} 획득했습니다. 현재 드래곤의 분노: ${player.dragonRage}`);
    }

    executeEvent(event, player) {
        switch (event.effect.type) {
            case 'heal':
                this.handleHealEvent(event, player);
                break;
            case 'fullHeal':
                this.handleFullHealEvent(event, player);
                break;
            case 'buffAttack':
                this.handleBuffAttackEvent(event, player);
                break;
            case 'buffDefense':
                this.handleBuffDefenseEvent(event, player);
                break;
            case 'buffHp':
                this.handleBuffHpEvent(event, player);
                break;
            case 'regenRing':
                this.handleRegenRingEvent(event, player);
                break;
            case 'escapeTicket':
                this.handleEscapeTicketEvent(event, player);
                break;
            case 'randomSkill':
                this.handleRandomSkillEvent(event, player);
                break;
            case 'buffAll':
                this.handleBuffAllEvent(event, player);
                break;
            default:
                console.error('Unknown event type:', event.effect.type);
        }
    }

    handleBuffAllEvent(event, player) {
        const buffPercent = event.effect.value;
        const statIncreases = player.updateAllStatsPercent(buffPercent);
        
        this.logManager.log(event.message.replace('{value}', buffPercent));
        this.logManager.log(`공격력 +${statIncreases.attackIncrease}, 방어력 +${statIncreases.defenseIncrease}, 최대 체력 +${statIncreases.hpIncrease}`);
    }

    handleHealEvent(event, player) {
        const healPercentage = event.effect.value;
        const maxHealAmount = Math.floor(player.maxHp * healPercentage);
        const actualHeal = Math.min(maxHealAmount, player.maxHp - player.hp);
        player.heal(actualHeal);
        const healMessage = event.message.replace('{healAmount}', actualHeal);
        this.logManager.log(healMessage);
    }

    handleFullHealEvent(event, player) {
        const healAmount = player.maxHp - player.hp;
        player.hp = player.maxHp;
        this.logManager.log(event.message.replace('{healAmount}', healAmount));
    }


    handleBuffAttackEvent(event, player) {
        const baseIncrease = event.effect.value;
        const percentIncrease = Math.floor(player.attack * 0.01); // 현재 공격력의 1%
        const totalIncrease = baseIncrease + percentIncrease;
        
        player.attack += totalIncrease;
        this.logManager.log(event.message.replace('{value}', `${totalIncrease}`));
    }

    handleBuffDefenseEvent(event, player) {
        const baseIncrease = event.effect.value;
        const percentIncrease = Math.floor(player.defense * 0.01); // 현재 방어력의 1%
        const totalIncrease = baseIncrease + percentIncrease;
        
        player.defense += totalIncrease;
        this.logManager.log(event.message.replace('{value}', `${totalIncrease}`));
    }

    handleBuffHpEvent(event, player) {
        player.maxHp += event.effect.value;
        player.hp += event.effect.value;  // 현재 체력도 같이 증가시킵니다.
        this.logManager.log(event.message.replace('{value}', `${event.effect.value}`));
    }


    handleRegenRingEvent(event, player) {
        const message = player.addRegenRing();
        this.logManager.log(message);
    }

    handleEscapeTicketEvent(event, player) {
        let ticketsGained;
        if (Math.random() < 0.1) {  // 10% 확률로 5개 티켓 획득
            ticketsGained = 5;
        } else {  // 90% 확률로 1~3개 티켓 랜덤 획득
            ticketsGained = Math.floor(Math.random() * 3) + 1;
        }
        
        player.runTickets += ticketsGained;
        this.logManager.log(event.message
            .replace('{value}', ticketsGained)
            .replace('{totalTickets}', player.runTickets));
    }
    handleRandomSkillEvent(event, player) {
        const randomSkill = event.effect.skills[Math.floor(Math.random() * event.effect.skills.length)];
        player.addSkill(randomSkill);
        this.logManager.log(event.message.replace('{skillName}', randomSkill.name).replace('{count}', randomSkill.count));
    }
}