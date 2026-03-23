// backend/services/bot.service.js

const BotService = {

    /**
     * Choisit la meilleure combinaison parmi celles disponibles
     * en vérifiant qu'il reste au moins une case libre sur la grille.
     * Priorité : yam > carre > full > suite > sec > defi > moinshuit > brelan
     */
    chooseBestCombination: (availableChoices, grid) => {
        if (!availableChoices || availableChoices.length === 0) return null;

        const priority = ['yam', 'carre', 'full', 'suite', 'sec', 'defi', 'moinshuit'];

        // Filtrer : ne garder que les combinaisons qui ont au moins une case libre
        const playable = availableChoices.filter(choice => {
            return grid.some(row =>
                row.some(cell => cell.id === choice.id && cell.owner === null)
            );
        });

        if (playable.length === 0) return null;

        // Trier par priorité
        for (const prio of priority) {
            const match = playable.find(c => c.id === prio);
            if (match) return match.id;
        }

        // Sinon prendre le premier disponible (brelan, etc.)
        return playable[0].id;
    },

    /**
     * Choisit la meilleure cellule libre sur la grille pour une combinaison donnée.
     * Retourne { cellId, rowIndex, cellIndex } ou null.
     */
    chooseBestCell: (choiceId, grid) => {
        for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
            for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
                const cell = grid[rowIndex][cellIndex];
                if (cell.id === choiceId && cell.owner === null) {
                    return { cellId: cell.id, rowIndex, cellIndex };
                }
            }
        }
        return null;
    },

    /**
     * Décide quels dés verrouiller entre les lancers.
     * Stratégie : garder la valeur la plus fréquente (si >= 2).
     * Retourne un tableau d'ids de dés à verrouiller.
     */
    chooseDicesToLock: (dices) => {
        const counts = {};
        dices.forEach(d => {
            const v = d.value;
            if (v !== '') {
                counts[v] = (counts[v] || 0) + 1;
            }
        });

        // Trouver la valeur la plus fréquente
        let bestValue = null;
        let bestCount = 0;
        for (const [value, count] of Object.entries(counts)) {
            if (count > bestCount) {
                bestCount = count;
                bestValue = value;
            }
        }

        // Si au moins une paire, verrouiller ces dés
        if (bestCount >= 2) {
            return dices
                .filter(d => d.value === bestValue)
                .map(d => d.id);
        }

        return [];
    },
};

module.exports = BotService;
