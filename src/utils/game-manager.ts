import { Game } from './game';

export interface GameInfo {
  hash: string;
  playerOne: string;
  playerTwo: string;
}

export class Manager {
  games: GameInfo[] = [];

  static GAMES_KEY = 'luna/ttt/games';
  static USER_KEY = 'luna/ttt/user';

  constructor() {}

  addOrUpdateGame(game: Game) {
    const games = this.getGames();

    const gameInfo: GameInfo = {
      hash: game.hash,
      playerOne: game.state.playerOne,
      playerTwo: game.state.playerTwo
    };

    const gameIndex = games.findIndex(g => g.hash === game.hash);

    let newGames;
    if (gameIndex !== -1) {
      // update
      newGames = [...games.slice(0, gameIndex), gameInfo, ...games.slice(gameIndex + 1)];
    } else {
      // add
      newGames = [...games, gameInfo];
    }

    this.save(newGames);

    return newGames;
  }

  deleteGame(deletedGame: Game) {
    const games = this.getGames();
    const newGames = games.filter(game => game.hash !== deletedGame.hash);
    this.save(newGames);

    return newGames;
  }

  getGames() {
    const rawGames = localStorage.getItem(Manager.GAMES_KEY);

    if (!rawGames) {
      return [];
    }

    try {
      const games = JSON.parse(rawGames);

      return games;
    } catch (_) {
      return [];
    }
  }

  save(games) {
    const rawGames = JSON.stringify(games);

    localStorage.setItem(Manager.GAMES_KEY, rawGames);
  }
}

export const GameManager = new Manager();
