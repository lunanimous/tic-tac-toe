import { r as registerInstance, h, H as Host } from './p-f79c9434.js';
import './p-093b16dd.js';
import { G as GameManager } from './p-8cf4f6bc.js';
import { G as Game } from './p-46fe3ca2.js';

const LunaHome = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.games = [];
    }
    componentWillLoad() {
        this.games = GameManager.getGames();
    }
    async createNewGame() {
        const game = await Game.generate();
        GameManager.addOrUpdateGame(game);
        this.history.push(`/game/${game.hash}`);
    }
    openGame(game) {
        this.history.push(`/game/${game.hash}`, {});
    }
    deleteGame(event, game) {
        event.stopPropagation();
        event.preventDefault();
        const shouldDelete = confirm('Do you really want to delete this game ?');
        if (!shouldDelete) {
            return;
        }
        this.games = GameManager.deleteGame(game);
    }
    render() {
        return (h(Host, null, h("div", { class: "flex items-end justify-between mb-6" }, h("h2", { class: "text-xl" }, "My games"), h("button", { type: "button", class: "button bg-gray-300 hover:bg-gray-400 focus:outline-none focus:shadow-outline", onClick: () => this.createNewGame() }, h("svg", { fill: "none", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", viewBox: "0 0 24 24", class: "w-6 h-6 mr-2" }, h("path", { d: "M12 4v16m8-8H4" })), h("span", null, "New game"))), this.games.length === 0 ? h("p", { class: "text-center py-12 px-4" }, "No games yet") : null, this.games.map(game => (h("div", { onClick: () => this.openGame(game), class: "flex items-center bg-white cursor-pointer rounded-md mt-4 p-4 shadow-lg" }, h("luna-player", { class: "flex-1", address: game.playerOne }), h("div", { class: "flex flex-none items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 font-bold mx-8" }, "vs"), h("luna-player", { class: "flex-1", address: game.playerTwo }), h("div", { class: "w-12 ml-2 flex items-center justify-center" }, h("button", { type: "button", onClick: e => this.deleteGame(e, game), "aria-label": "Delete", "data-microtip-position": "top", role: "tooltip", class: "button bg-red-100 hover:bg-red-200 px-2 text-red-600 focus:outline-none focus:shadow-outline" }, h("svg", { fill: "none", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", viewBox: "0 0 24 24", class: "w-8 h-8" }, h("path", { d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" })))))))));
    }
};

export { LunaHome as luna_home };
