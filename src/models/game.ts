import { Wallet, ClientTransactionDetails } from '@nimiq/core-web';
import { nimiqLoaded, consensusEstablished, nimiq } from './nimiq';

interface Move {
  hash: string;
  address: string;
  field: string;
}

export interface Board {
  a1: number;
  a2: number;
  a3: number;
  b1: number;
  b2: number;
  b3: number;
  c1: number;
  c2: number;
  c3: number;
}

export class Game {
  wallet: Wallet;
  playerOne: string;
  playerTwo: string;
  moves: Move[];
  nextPlayer: string;
  listeners: Function[] = [];
  board: Board = {
    a1: 0,
    a2: 0,
    a3: 0,
    b1: 0,
    b2: 0,
    b3: 0,
    c1: 0,
    c2: 0,
    c3: 0
  };

  constructor(wallet) {
    this.wallet = wallet;
  }

  async initialize() {
    await consensusEstablished();

    const transactions = await nimiq.client.getTransactionsByAddress(
      this.wallet.address
    );

    console.log(transactions);
    // handle existing transactions
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

    // initialize player if not done yet
    if (!this.playerOne) {
      this.playerOne = move.address;
    } else if (!this.playerTwo) {
      this.playerTwo = move.address;
    }

    const isPlayerOne = move.address === this.playerOne;
    const isPlayerTwo = move.address === this.playerTwo;

    // play move on board
    this.board[move.field] = isPlayerOne ? 1 : isPlayerTwo ? 2 : 0;

    this.update();
    console.log(this.board);
  }

  isValidMove(move: Move): boolean {
    // TODO
    console.log(move);

    return true;
  }

  addUpdateListener(callback) {
    this.listeners.push(callback);
  }

  update() {
    this.listeners.forEach(callback => {
      const state = {
        address: this.wallet.address.toUserFriendlyAddress(),
        board: this.board,
        playerOne: this.playerOne,
        playerTwo: this.playerTwo
      };

      callback(state);
    });
  }

  convertTransactionToMove(transaction: ClientTransactionDetails): Move {
    const sender = transaction.sender;

    return {
      hash: transaction.transactionHash.toString(),
      address: sender.toUserFriendlyAddress(),
      field: Nimiq.BufferUtils.toAscii(transaction.data.raw)
    };
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
