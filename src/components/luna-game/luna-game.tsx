import { Component, h, Prop, State, Listen } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { initializeNimiq, nimiq } from '../../models/nimiq';
import { Game, Board } from '../../models/game';

@Component({
  tag: 'luna-game'
})
export class LunaGame {
  @Prop() match: MatchResults;

  @State() address: string = '';
  @State() playerOne: string;
  @State() playerTwo: string;
  @State() board: Board;

  @Listen('fieldSelected')
  async onFieldSelected(event) {
    console.log(event.detail);
    const field = event.detail;

    const options = {
      appName: 'Tic Tac Toe',
      recipient: this.address,
      value: 1 * 1e5,
      extraData: field
    };

    // All client requests are async and return a promise
    const signedTransaction = await nimiq.hub.checkout(options);
    console.log(signedTransaction);
  }

  async componentWillLoad() {
    let _address;
    if (this.match && this.match.params && this.match.params.game) {
      _address = this.match.params.game;
    } else {
      _address = null;
    }

    initializeNimiq();

    const game = await Game.fromUrlAddress(_address);

    game.addUpdateListener(state => {
      this.address = state.address;
      this.board = Object.assign({}, state.board);
      this.playerOne = state.playerOne;
      this.playerTwo = state.playerTwo;
    });

    game.initialize();

    console.log(game);
  }

  render() {
    return (
      <div class="relative bg-white rounded-md mt-4 p-4 shadow-lg">
        <div class="flex w-full items-center">
          <luna-player class="flex-1" address={this.playerOne}></luna-player>
          <div class="flex flex-none items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 font-bold mx-8">
            vs
          </div>
          <luna-player class="flex-1" address={this.playerTwo}></luna-player>
        </div>

        <p class="p-6 text-center">Waiting for players...</p>

        <div class="flex items-center justify-center mt-8 mb-8">
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
        </div>

        <p>{this.address}</p>
      </div>
    );
  }
}
