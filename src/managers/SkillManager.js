export class SkillManager {
    constructor(skillData, logManager) {
        this.skills = skillData.skills;
        this.logManager = logManager;
    }

    useSkill(skillName, user, target) {
        const skill = this.skills.find(s => s.name === skillName);
        if (!skill) {
            console.error(`Skill not found: ${skillName}`);
            return null;
        }

        let effect = '';
        switch (skill.type) {
            case 'heal':
                effect = this.healEffect(skill, user);
                break;
            case 'damage':
                effect = this.damageEffect(skill, target);
                break;
            case 'buff':
                effect = this.buffEffect(skill, user);
                break;
            default:
                console.error(`Unknown skill type: ${skill.type}`);
                return null;
        }

        return skill.description
            .replace('{target}', target.name)
            .replace('{value}', effect);
    }

    healEffect(skill, user) {
        const healAmount = user.heal(skill.value);
        return healAmount;
    }

    damageEffect(skill, target) {
        const damageAmount = target.takeDamage(skill.value);
        return damageAmount;
    }

    buffEffect(skill, user) {
        user[skill.stat] += skill.value;
        user.statusEffects.push({
            name: skill.name,
            duration: skill.duration,
            apply: (target) => { target[skill.stat] -= skill.value; }
        });
        return skill.value;
    }
}