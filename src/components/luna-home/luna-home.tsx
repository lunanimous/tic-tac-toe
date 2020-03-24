import { Component, h, Host, State } from "@stencil/core";

@Component({
  tag: "luna-home"
})
export class LunaHome {
  @State() games = [
    {
      address: "123456789",
      playerOne: "NQ05 EYDD HLP3 J57S P6YJ JL0X SJDK RF9K A9QV",
      playerTwo: "NQ19 97P8 BRJY YY4X E5AM TG5J 45HM 7PX0 6H37",
      winner: null
    },
    {
      address: "123456789",
      playerOne: "NQ05 EYDD HLP3 J57S P6YJ JL0X SJDK RF9K A9QV",
      playerTwo: "NQ19 97P8 BRJY YY4X E5AM TG5J 45HM 7PX0 6H37",
      winner: null
    }
  ];

  createNewGame() {
    alert("new game");
  }

  openGame(game: any) {
    alert("open game" + game);
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

        {this.games.map(game => (
          <div
            onClick={() => this.openGame(game)}
            class="relative group overflow-hidden flex items-center bg-white cursor-pointer rounded-md mt-4 p-4 shadow-lg"
          >
            <div class="absolute z-10 inset-0 flex items-center justify-center opacity-0 group-hover:opacity-75 transform duration-100 bg-white">
              <p class="font-bold">View game</p>
            </div>
            <luna-player class="flex-1" address={game.playerOne}></luna-player>
            <div class="flex flex-none items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 font-bold mx-8">
              vs
            </div>
            <luna-player class="flex-1" address={game.playerTwo}></luna-player>
          </div>
        ))}
      </Host>
    );
  }
}
