async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to load JSON from ${path}:`, error);
        return null;
    }
}

export async function loadGameData() {
    const [textData, monsterData, eventData, skillData, stageData] = await Promise.all([
        loadJSON('data/text.json'),
        loadJSON('data/monsters.json'),
        loadJSON('data/events.json'),
        loadJSON('data/skills.json'),
        loadJSON('data/stages.json')
    ]);

    if (!textData || !monsterData || !eventData || !skillData || !stageData) {
        throw new Error('Failed to load game data');
    }

    return {
        textData,
        monsterData,
        eventData,
        skillData,
        stageData
    };
}