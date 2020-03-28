import { Component, h, Prop, State, Listen } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { initializeNimiq, nimiq } from '../../models/nimiq';
import { Game, Board } from '../../models/game';

enum GAME_STATUS {
  LOADING,
  JOIN,
  WAIT,
  PLAY
}

@Component({
  tag: 'luna-game'
})
export class LunaGame {
  connectedPlayer: string = null;

  @Prop() match: MatchResults;

  @State() status: GAME_STATUS = GAME_STATUS.LOADING;
  @State() address: string = '';
  @State() playerOne: string;
  @State() playerTwo: string;
  @State() nextPlayer: string;
  @State() board: Board = {};

  @Listen('fieldSelected')
  async onFieldSelected(event) {
    console.log(event.detail);
    const field = event.detail;

    this.play(field);
  }

  async join() {
    const options = {
      appName: 'Tic Tac Toe',
      recipient: this.address,
      value: 1 * 1e5,
      extraData: Game.JOIN
    };

    const signedTransaction = await nimiq.hub.checkout(options);
    console.log(signedTransaction);
  }

  async play(field) {
    const options = {
      appName: 'Tic Tac Toe',
      recipient: this.address,
      value: 1 * 1e5,
      extraData: field
    };

    const signedTransaction = await nimiq.hub.checkout(options);
    console.log(signedTransaction);
  }

  async componentDidLoad() {
    this.connectedPlayer = nimiq.user;

    let _address;
    if (this.match && this.match.params && this.match.params.game) {
      _address = this.match.params.game;
    } else {
      _address = null;
    }

    initializeNimiq();

    const game = await Game.fromUrlAddress(_address);
    game.addObserver(this.update.bind(this));
    game.initialize();
  }

  update(state) {
    console.log(state);
    this.address = state.address;
    this.board = state.board;
    this.playerOne = state.playerOne;
    this.playerTwo = state.playerTwo;
    this.nextPlayer = state.nextPlayer;

    const noPlayers = !this.playerOne && !this.playerTwo;
    const otherPlayerJoined =
      this.playerOne &&
      !this.playerTwo &&
      this.connectedPlayer !== this.playerOne;

    if (noPlayers || otherPlayerJoined) {
      this.status = GAME_STATUS.JOIN;
      return;
    }

    if (this.connectedPlayer === this.nextPlayer) {
      this.status = GAME_STATUS.PLAY;
      return;
    }

    this.status = GAME_STATUS.WAIT;
  }

  render() {
    return (
      <div class="relative bg-white rounded-md mt-4 p-4 shadow-lg">
        <div class="flex w-full items-center mb-2">
          <p class="flex-1 text-center mr-12 pr-2 text-lg">Player X</p>
          <p class="flex-1 text-center ml-12 pl-2 text-lg">Player O</p>
        </div>
        <div class="flex w-full items-center">
          <luna-player class="flex-1" address={this.playerOne}></luna-player>
          <div class="flex flex-none items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 font-bold mx-8">
            vs
          </div>
          <luna-player class="flex-1" address={this.playerTwo}></luna-player>
        </div>

        <div class="relative flex items-center justify-center mt-8 mb-8 overflow-hidden">
          <div>
            <div class="flex">
              <luna-field name={'a1'} value={this.board['a1']}></luna-field>
              <luna-field
                name={'a2'}
                value={this.board['a2']}
                middle={true}
              ></luna-field>
              <luna-field name={'a3'} value={this.board['a3']}></luna-field>
            </div>
            <div class="flex border-t-2 border-b-2 border-indigo-800">
              <luna-field name={'b1'} value={this.board['b1']}></luna-field>
              <luna-field
                name={'b2'}
                value={this.board['b2']}
                middle={true}
              ></luna-field>
              <luna-field name={'b3'} value={this.board['b3']}></luna-field>
            </div>
            <div class="flex">
              <luna-field name={'c1'} value={this.board['c1']}></luna-field>
              <luna-field
                name={'c2'}
                value={this.board['c2']}
                middle={true}
              ></luna-field>
              <luna-field name={'c3'} value={this.board['c3']}></luna-field>
            </div>
          </div>

          {this.status === GAME_STATUS.LOADING ? (
            <div class="absolute inset-0 flex items-center justify-center light-overlay">
              <p class="text-lg font-bold">Loading...</p>
            </div>
          ) : null}

          {this.status === GAME_STATUS.JOIN ? (
            <div class="absolute inset-0 flex items-center justify-center light-overlay">
              <button
                onClick={() => {
                  this.join();
                }}
                type="button"
                class="button bg-indigo-700 hover:bg-indigo-800 text-white focus:outline-none focus:shadow-outline px-6 py-2"
              >
                Join game
              </button>
            </div>
          ) : null}

          {this.status === GAME_STATUS.WAIT ? (
            <div class="absolute inset-0 flex items-center justify-center light-overlay">
              <p class="text-lg font-bold">Waiting for other player...</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
