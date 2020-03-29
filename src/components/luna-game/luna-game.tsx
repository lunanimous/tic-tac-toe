import { Component, h, Prop, State, Listen, Element, Host } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import QrCode from '../../vendor/qr-code.min.js';
import { nimiq } from '../../utils/nimiq';
import { Game, Board, Sign } from '../../utils/game';
import { GlobalConfig } from '../../utils/config';

enum GAME_STATUS {
  LOADING,
  JOIN,
  WAIT,
  PLAY,
  WON,
  LOST,
  TIE,
  NOT_IN_GAME,
  PENDING
}

@Component({
  tag: 'luna-game'
})
export class LunaGame {
  connectedPlayer: string;
  simulatedSign: number = Sign.Empty;

  @Element() el: HTMLElement;

  @Prop() match: MatchResults;

  @State() status: GAME_STATUS = GAME_STATUS.LOADING;
  @State() address: string = '';
  @State() playerOne: string;
  @State() playerTwo: string;
  @State() nextPlayer: string;
  @State() board: Board = {};

  @State() isShareModalOpen = false;

  @Listen('fieldSelected')
  async onFieldSelected(event) {
    const field = event.detail;

    this.play(field);
  }

  async componentDidLoad() {
    this.connectedPlayer = nimiq.user;

    // setup mouse listener
    this.setupHoverListeners();

    let _address;
    if (this.match && this.match.params && this.match.params.game) {
      _address = this.match.params.game;
    } else {
      _address = null;
    }

    const game = await Game.fromUrlAddress(_address);
    game.addObserver(this.update.bind(this));
    game.initialize();
  }

  setupHoverListeners() {
    const fields = this.el.querySelectorAll('luna-field');

    const overHandler = event => {
      const field = event.target.name;

      if (this.board[field] !== Sign.Empty) {
        return;
      }

      this.board = {
        ...this.board,
        [field]: this.simulatedSign
      };
    };

    const leaveHandler = event => {
      const field = event.target.name;

      const isSimulated = this.board[field] === Sign.SimCircle || this.board[field] === Sign.SimCross;

      if (!isSimulated) {
        return;
      }

      this.board = {
        ...this.board,
        [field]: Sign.Empty
      };
    };

    fields.forEach(field => {
      field.addEventListener('mouseenter', overHandler);
      field.addEventListener('mouseleave', leaveHandler);
    });
  }

  async join() {
    const options = {
      appName: GlobalConfig.appName,
      sender: this.connectedPlayer,
      recipient: this.address,
      value: GlobalConfig.cost,
      fee: GlobalConfig.fee,
      extraData: Game.JOIN
    };

    await nimiq.hub.checkout(options);
  }

  async play(field) {
    const options = {
      appName: GlobalConfig.appName,
      sender: this.connectedPlayer,
      recipient: this.address,
      value: GlobalConfig.cost,
      fee: GlobalConfig.fee,
      extraData: field
    };

    await nimiq.hub.checkout(options);
  }

  share() {
    this.isShareModalOpen = true;

    document.querySelector('#qr-code').innerHTML = '';
    QrCode.render(
      {
        text: location.href,
        radius: 0.5, // 0.0 to 0.5
        ecLevel: 'H', // L, M, Q, H
        fill: '#536DFE', // foreground color
        background: null, // color or null for transparent
        size: 256 // in pixels
      },
      document.querySelector('#qr-code')
    );
  }

  copy(e) {
    const urlInput = document.querySelector('#share-url') as HTMLInputElement;

    urlInput.select();
    document.execCommand('copy');

    urlInput.blur();
    e.target.focus();
  }

  update(state) {
    console.debug(state);
    this.address = state.address;
    this.board = state.board;
    this.playerOne = state.playerOne;
    this.playerTwo = state.playerTwo;
    this.nextPlayer = state.nextPlayer;

    // which sign does the current user have ?
    this.simulatedSign = this.connectedPlayer === this.playerOne ? Sign.SimCross : Sign.SimCircle;

    const noPlayers = !this.playerOne && !this.playerTwo;
    const otherPlayerJoined = this.playerOne && !this.playerTwo && this.connectedPlayer !== this.playerOne;

    if (noPlayers || otherPlayerJoined) {
      this.status = GAME_STATUS.JOIN;
      return;
    }

    if (this.nextPlayer === this.connectedPlayer && state.lastMovePending) {
      this.status = GAME_STATUS.PENDING;
      return;
    }

    if (
      this.playerOne &&
      this.playerTwo &&
      this.connectedPlayer !== this.playerOne &&
      this.connectedPlayer !== this.playerTwo
    ) {
      this.status = GAME_STATUS.NOT_IN_GAME;
      return;
    }

    if (state.winner === 'tie') {
      this.status = GAME_STATUS.TIE;
      return;
    }

    if (state.winner === this.connectedPlayer) {
      this.status = GAME_STATUS.WON;
      return;
    } else if (state.winner && state.winner !== this.connectedPlayer) {
      this.status = GAME_STATUS.LOST;
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
      <Host>
        <div class="flex w-full items-center justify-between">
          <stencil-route-link
            url="/"
            exact={true}
            anchorClass="button bg-gray-300 hover:bg-gray-400 focus:outline-none focus:shadow-outline"
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
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>My Games</span>
          </stencil-route-link>
          <button
            type="button"
            onClick={() => this.share()}
            class="button bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:shadow-outline"
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
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            <span>Share</span>
          </button>
        </div>
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
                <luna-field name={'a2'} value={this.board['a2']} middle={true}></luna-field>
                <luna-field name={'a3'} value={this.board['a3']}></luna-field>
              </div>
              <div class="flex border-t-2 border-b-2 border-indigo-800">
                <luna-field name={'b1'} value={this.board['b1']}></luna-field>
                <luna-field name={'b2'} value={this.board['b2']} middle={true}></luna-field>
                <luna-field name={'b3'} value={this.board['b3']}></luna-field>
              </div>
              <div class="flex">
                <luna-field name={'c1'} value={this.board['c1']}></luna-field>
                <luna-field name={'c2'} value={this.board['c2']} middle={true}></luna-field>
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

            {this.status === GAME_STATUS.WON ? (
              <div class="absolute inset-0 flex items-center justify-center light-overlay">
                <p class="text-lg font-bold">Congratulations, you won !</p>
              </div>
            ) : null}

            {this.status === GAME_STATUS.LOST ? (
              <div class="absolute inset-0 flex items-center justify-center light-overlay">
                <p class="text-lg font-bold">Game over !</p>
              </div>
            ) : null}

            {this.status === GAME_STATUS.TIE ? (
              <div class="absolute inset-0 flex items-center justify-center light-overlay">
                <p class="text-lg font-bold">It's a tie !</p>
              </div>
            ) : null}

            {this.status === GAME_STATUS.NOT_IN_GAME ? (
              <div class="absolute inset-0 flex items-center justify-center light-overlay">
                <p class="text-lg font-bold">Hum, looks like you're not in this game</p>
              </div>
            ) : null}

            {this.status === GAME_STATUS.PENDING ? (
              <div class="absolute inset-0 flex items-center justify-center light-overlay">
                <p class="text-lg font-bold">Transaction is on its way...</p>
              </div>
            ) : null}
          </div>
        </div>

        <div
          class={{
            'dark-overlay fixed inset-0 flex items-center justify-center': true,
            'opacity-0 pointer-events-none': !this.isShareModalOpen,
            'opacity-100 pointer-events-auto': this.isShareModalOpen
          }}
        >
          <div class="bg-white rounded-md m-4 p-4 shadow-lg w-full max-w-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-center text-xl font-bold">Share</h3>
              <button
                type="button"
                class="button bg-gray-300 hover:bg-gray-400 focus:outline-none focus:shadow-outline p-2"
                onClick={() => (this.isShareModalOpen = false)}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  class="w-6 h-6"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div id="qr-code" class="flex justify-center p-6"></div>

            <p class="text-center uppercase tracking-wide text-gray-500 mb-4">or</p>

            <input
              id="share-url"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              readOnly
              value={location.href}
            ></input>

            <div class="flex justify-center mt-4 mb-4">
              <button
                type="button"
                class="button bg-gray-100 hover:bg-gray-200 focus:outline-none focus:shadow-outline"
                onClick={e => this.copy(e)}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  class="w-4 h-4 mr-2"
                >
                  <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
