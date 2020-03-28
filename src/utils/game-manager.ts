import { Game } from './game';

export interface GameInfo {
  hash: string;
  playerOne: string;
  playerTwo: string;
  winner: string;
}

export class Manager {
  games: GameInfo[] = [];

  static GAMES_KEY = 'luna/ttt/games';
  static USER_KEY = 'luna/ttt/user';

  constructor() {}

  addGame(game: Game) {
    const gameInfo: GameInfo = {
      hash: game.hash,
      playerOne: null,
      playerTwo: null,
      winner: null
    };

    this.games.push(gameInfo);

    this.saveToStorage();
  }

  deleteGame(deletedGame: Game) {
    this.games = this.games.filter(game => game.hash !== deletedGame.hash);

    this.saveToStorage();
  }

  importFromStorage() {
    const json = JSON.parse(localStorage.getItem(Manager.GAMES_KEY));

    this.games = json ? json : [];
  }

  saveToStorage() {
    localStorage.setItem(Manager.GAMES_KEY, JSON.stringify(this.games));
  }
}

export const GameManager = new Manager();
