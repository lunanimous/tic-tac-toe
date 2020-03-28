import { Wallet, ClientTransactionDetails } from '@nimiq/core-web';
import { nimiqLoaded, consensusEstablished, nimiq } from './nimiq';

interface Move {
  hash: string;
  address: string;
  field: string;
}

export interface Board {
  a1?: number;
  a2?: number;
  a3?: number;
  b1?: number;
  b2?: number;
  b3?: number;
  c1?: number;
  c2?: number;
  c3?: number;
}

export interface GameState {
  address: string;
  playerOne: string;
  playerTwo: string;
  moves: Move[];
  nextPlayer: string;
  board: Board;
}

export class Game {
  wallet: Wallet;
  observers: Function[] = [];

  state: GameState = {
    address: null,
    playerOne: null,
    playerTwo: null,
    moves: [],
    nextPlayer: null,
    board: {
      a1: 0,
      a2: 0,
      a3: 0,
      b1: 0,
      b2: 0,
      b3: 0,
      c1: 0,
      c2: 0,
      c3: 0
    }
  };

  static JOIN = 'join';
  static ALLOWED_MOVES = [
    'a1',
    'a2',
    'a3',
    'b1',
    'b2',
    'b3',
    'c1',
    'c2',
    'c3',
    Game.JOIN
  ];

  constructor(wallet) {
    this.wallet = wallet;
  }

  async initialize() {
    this.state.address = this.wallet.address.toUserFriendlyAddress();
    this.notify();

    await consensusEstablished();

    const transactions = await nimiq.client.getTransactionsByAddress(
      this.wallet.address
    );

    console.log(transactions);
    // handle existing transactions (oldest first)
    const moves = transactions
      .sort((t1, t2) => {
        return t1.timestamp - t2.timestamp;
      })
      .map(transaction => {
        return this.convertTransactionToMove(transaction);
      });

    // play existing moves
    moves.forEach(move => this.addMove(move));

    // start listening for new transactions
    nimiq.client.addTransactionListener(
      (transaction: ClientTransactionDetails) => {
        const move = this.convertTransactionToMove(transaction);

        this.addMove(move);
      },
      [this.wallet.address]
    );
  }

  addMove(move: Move) {
    if (!this.isValidMove(move)) {
      // invalid move, we ignore it
      return;
    }

    this.state.moves.push(move);

    // initialize player if not done yet
    if (!this.state.playerOne) {
      this.state.playerOne = move.address;
    } else if (!this.state.playerTwo) {
      this.state.playerTwo = move.address;
    }

    const isPlayerOne = move.address === this.state.playerOne;
    const isPlayerTwo = move.address === this.state.playerTwo;

    // play move on board
    if (move.field !== Game.JOIN) {
      this.state.board[move.field] = isPlayerOne ? 1 : isPlayerTwo ? 2 : 0;
    }

    this.notify();
  }

  isValidMove(move: Move): boolean {
    if (
      move.field !== Game.JOIN &&
      !this.state.playerOne &&
      !this.state.playerTwo
    ) {
      // no players yet, first they need to join
      return false;
    }

    if (
      move.field === Game.JOIN &&
      this.state.playerOne &&
      this.state.playerTwo
    ) {
      // not accepting new players
      return false;
    }

    if (Game.ALLOWED_MOVES.indexOf(move.field) === -1) {
      // unallowed move
      return false;
    }

    if (move.field !== Game.JOIN && this.state.board[move.field] !== 0) {
      // field has already been player
      return false;
    }

    if (
      move.field !== Game.JOIN &&
      this.state.nextPlayer !== null &&
      this.state.nextPlayer !== move.address
    ) {
      // not this player's turn
      return false;
    }

    console.log(move);

    return true;
  }

  convertTransactionToMove(transaction: ClientTransactionDetails): Move {
    const sender = transaction.sender;

    return {
      hash: transaction.transactionHash.toString(),
      address: sender.toUserFriendlyAddress(),
      field: Nimiq.BufferUtils.toAscii(transaction.data.raw)
    };
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  notify() {
    this.observers.forEach(callback => {
      const state = Object.assign({}, this.state, {
        board: Object.assign({}, this.state.board)
      });

      callback(state);
    });
  }

  // static async newGame(): Game {
  //   // TODO: generate new game
  //   return {};
  // }

  static async fromUrlAddress(address: string): Promise<Game> {
    await nimiqLoaded();

    const cleanKey = address.replace(/\=/g, '.');
    const buffer = Nimiq.BufferUtils.fromBase64Url(cleanKey);
    const wallet = Nimiq.Wallet.loadPlain(buffer);

    console.log(wallet.address.toUserFriendlyAddress());

    return new Game(wallet);
  }
}
