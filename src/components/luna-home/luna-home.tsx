import { Component, h, Host, State, Prop } from '@stencil/core';
import { RouterHistory } from '@stencil/router';
import { Game } from '../../utils/game';
import { GameManager, GameInfo } from '../../utils/game-manager';

@Component({
  tag: 'luna-home'
})
export class LunaHome {
  @Prop() history: RouterHistory;

  @State() games: GameInfo[] = [];

  componentWillLoad() {
    this.games = GameManager.getGames();
  }

  async createNewGame() {
    const game = await Game.generate();
    GameManager.addOrUpdateGame(game);

    this.history.push(`/game/${game.hash}`);
  }

  openGame(game: any) {
    this.history.push(`/game/${game.hash}`, {});
  }

  deleteGame(event, game: any) {
    event.stopPropagation();
    event.preventDefault();

    const shouldDelete = confirm('Do you really want to delete this game ?');

    if (!shouldDelete) {
      return;
    }

    this.games = GameManager.deleteGame(game);
  }

  render() {
    return (
      <Host>
        <div class="flex items-end justify-between mb-6">
          <h2 class="text-xl">My games</h2>
          <button
            type="button"
            class="button bg-gray-300 hover:bg-gray-400 focus:outline-none focus:shadow-outline"
            onClick={() => this.createNewGame()}
          >
            <svg
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              class="w-6 h-6 mr-2"
            >
              <path d="M12 4v16m8-8H4"></path>
            </svg>
            <span>New game</span>
          </button>
        </div>

        {this.games.length === 0 ? <p class="text-center py-12 px-4">No games yet</p> : null}

        {this.games.map(game => (
          <div
            onClick={() => this.openGame(game)}
            class="flex items-center bg-white cursor-pointer rounded-md mt-4 p-4 shadow-lg"
          >
            <luna-player class="flex-1" address={game.playerOne}></luna-player>
            <div class="flex flex-none items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 font-bold mx-8">
              vs
            </div>
            <luna-player class="flex-1" address={game.playerTwo}></luna-player>
            <div class="w-12 ml-2 flex items-center justify-center">
              <button
                type="button"
                onClick={e => this.deleteGame(e, game)}
                aria-label="Delete"
                data-microtip-position="top"
                role="tooltip"
                class="button bg-red-100 hover:bg-red-200 px-2 text-red-600 focus:outline-none focus:shadow-outline"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  class="w-8 h-8"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </Host>
    );
  }
}
