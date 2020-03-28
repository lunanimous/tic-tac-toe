import { Wallet, ClientTransactionDetails } from '@nimiq/core-web';
import { nimiqLoaded, consensusEstablished, nimiq } from './nimiq';
import { areEqual } from './utils';
import { GlobalConfig } from './config';

export enum Sign {
  Empty = 0,
  Cross = 1,
  Circle = 2,
  SimCross = 3,
  SimCircle = 4
}

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
  winner?: string;
}

export class Game {
  wallet: Wallet;
  handledHashes: string[] = [];
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

  static FEE = GlobalConfig.fee;
  static JOIN = 'join';
  static ALLOWED_MOVES = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3', Game.JOIN];

  constructor(wallet) {
    this.wallet = wallet;
  }

  async initialize() {
    this.state.address = this.wallet.address.toUserFriendlyAddress();

    await consensusEstablished;

    const transactions = await nimiq.client.getTransactionsByAddress(this.wallet.address);

    console.log(transactions);

    // handle existing transactions (oldest first)
    const moves = transactions
      .filter(transaction => {
        const isMined = transaction.state !== Nimiq.Client.TransactionState.MINED;
        const isConfirmed = transaction.state !== Nimiq.Client.TransactionState.CONFIRMED;

        return isMined || isConfirmed;
      })
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
        const isMined = transaction.state !== Nimiq.Client.TransactionState.MINED;
        const isConfirmed = transaction.state !== Nimiq.Client.TransactionState.CONFIRMED;

        if (!isMined && !isConfirmed) {
          // we ignore unconfirmed transactions
          return;
        }

        const move = this.convertTransactionToMove(transaction);

        this.addMove(move);
      },
      [this.wallet.address]
    );

    // notify (in case there were no moves)
    this.notify();
  }

  addMove(move: Move) {
    if (!this.isValidMove(move)) {
      // invalid move, we ignore it
      return;
    }

    this.state.moves.push(move);
    this.handledHashes.push(move.hash);

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
      this.state.board[move.field] = isPlayerOne ? Sign.Cross : isPlayerTwo ? Sign.Circle : Sign.Empty;
    }

    // set next player
    this.state.nextPlayer = isPlayerOne ? this.state.playerTwo : this.state.playerOne;

    if (this.isWon()) {
      // victory
      this.state.winner = move.address;
      this.reward();
    }

    if (!this.state.winner && this.state.moves.length >= 2 + 9) {
      // tie
      this.state.winner = 'tie';
      this.refund();
    }

    this.notify();
  }

  isValidMove(move: Move): boolean {
    if (this.handledHashes.indexOf(move.hash) > -1) {
      // already handled that transaction
      return false;
    }

    if (move.field !== Game.JOIN && !this.state.playerOne && !this.state.playerTwo) {
      // no players yet, first they need to join
      return false;
    }

    if (move.field === Game.JOIN && this.state.playerOne && this.state.playerTwo) {
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

    if (move.field !== Game.JOIN && this.state.nextPlayer !== null && this.state.nextPlayer !== move.address) {
      // not this player's turn
      return false;
    }

    return true;
  }

  async reward() {
    const account = await nimiq.client.getAccount(this.wallet.address);

    const transaction = this.wallet.createTransaction(
      Nimiq.Address.fromUserFriendlyAddress(this.state.winner),
      account.balance - Game.FEE,
      Game.FEE,
      await nimiq.client.getHeadHeight()
    );

    nimiq.client.sendTransaction(transaction);
  }

  async refund() {
    const account = await nimiq.client.getAccount(this.wallet.address);
    const share = Math.floor(account.balance / 2);

    const headHeight = await nimiq.client.getHeadHeight();

    // player 1
    const transaction1 = this.wallet.createTransaction(
      Nimiq.Address.fromUserFriendlyAddress(this.state.playerOne),
      share - Game.FEE,
      Game.FEE,
      headHeight
    );

    // player 2
    const transaction2 = this.wallet.createTransaction(
      Nimiq.Address.fromUserFriendlyAddress(this.state.playerTwo),
      account.balance - share - Game.FEE,
      Game.FEE,
      headHeight
    );

    nimiq.client.sendTransaction(transaction1);
    nimiq.client.sendTransaction(transaction2);
  }

  isWon() {
    return this.checkRows() || this.checkColumns() || this.checkDiagonals();
  }

  checkRows() {
    const rows = [1, 2, 3];
    const board = this.state.board;

    return rows.some(row => {
      if (board[`a${row}`] === Sign.Empty) {
        return false;
      }

      return areEqual(board[`a${row}`], board[`b${row}`], board[`c${row}`]);
    });
  }

  checkColumns() {
    const columns = ['a', 'b', 'c'];
    const board = this.state.board;

    return columns.some(col => {
      if (board[`${col}1`] === Sign.Empty) {
        return false;
      }

      return areEqual(board[`${col}1`], board[`${col}2`], board[`${col}3`]);
    });
  }

  checkDiagonals() {
    const board = this.state.board;

    if (board['b2'] === Sign.Empty) {
      return false;
    }

    const leftDiagonal = areEqual(board['a1'], board['b2'], board['c3']);
    const rightDiagonal = areEqual(board['a3'], board['b2'], board['c1']);

    return leftDiagonal || rightDiagonal;
  }

  convertTransactionToMove(transaction: ClientTransactionDetails): Move {
    const sender = transaction.sender;

    return {
      hash: transaction.transactionHash.toString(),
      address: sender.toUserFriendlyAddress(),
      field: Nimiq.BufferUtils.toAscii(transaction.data.raw)
    };
  }

  get hash() {
    const buffer = this.wallet.exportPlain();
    const urlSafe = Nimiq.BufferUtils.toBase64Url(buffer).replace(/\./g, '=');

    return urlSafe;
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

  static async generate(): Promise<Game> {
    await nimiqLoaded;
    const wallet = Nimiq.Wallet.generate();

    return new Game(wallet);
  }

  static async fromUrlAddress(address: string): Promise<Game> {
    await nimiqLoaded;

    const cleanKey = address.replace(/\=/g, '.');
    const buffer = Nimiq.BufferUtils.fromBase64Url(cleanKey);
    const wallet = Nimiq.Wallet.loadPlain(buffer);

    return new Game(wallet);
  }
}
