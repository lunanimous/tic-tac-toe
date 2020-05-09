class Manager {
    constructor() {
        this.games = [];
    }
    setUser(userAddress) {
        this.userAddress = userAddress;
    }
    addOrUpdateGame(game) {
        const games = this.getGames();
        const gameInfo = {
            hash: game.hash,
            playerOne: game.state.playerOne,
            playerTwo: game.state.playerTwo
        };
        const gameIndex = games.findIndex(g => g.hash === game.hash);
        let newGames;
        if (gameIndex !== -1) {
            // update
            newGames = [...games.slice(0, gameIndex), gameInfo, ...games.slice(gameIndex + 1)];
        }
        else {
            // add
            newGames = [...games, gameInfo];
        }
        this.save(newGames);
        return newGames;
    }
    deleteGame(deletedGame) {
        const games = this.getGames();
        const newGames = games.filter(game => game.hash !== deletedGame.hash);
        this.save(newGames);
        return newGames;
    }
    getGames() {
        const key = Manager.GAMES_KEY + this.userAddress;
        const rawGames = localStorage.getItem(key);
        if (!rawGames) {
            return [];
        }
        try {
            const games = JSON.parse(rawGames);
            return games;
        }
        catch (_) {
            return [];
        }
    }
    save(games) {
        const key = Manager.GAMES_KEY + this.userAddress;
        const rawGames = JSON.stringify(games);
        localStorage.setItem(key, rawGames);
    }
}
Manager.GAMES_KEY = 'luna/ttt/games/';
const GameManager = new Manager();

export { GameManager as G };
