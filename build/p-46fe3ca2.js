import { G as GlobalConfig } from './p-f79c9434.js';
import { c as consensusEstablished, n as nimiq, N as Nimiq, a as nimiqLoaded } from './p-093b16dd.js';

function areEqual(...args) {
    var len = args.length;
    for (var i = 1; i < len; i++) {
        if (args[i] === null || args[i] !== args[i - 1])
            return false;
    }
    return true;
}

var Sign;
(function (Sign) {
    Sign[Sign["Empty"] = 0] = "Empty";
    Sign[Sign["Cross"] = 1] = "Cross";
    Sign[Sign["Circle"] = 2] = "Circle";
    Sign[Sign["SimCross"] = 3] = "SimCross";
    Sign[Sign["SimCircle"] = 4] = "SimCircle";
})(Sign || (Sign = {}));
class Game {
    constructor(wallet) {
        this.handledHashes = [];
        this.observers = [];
        this.state = {
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
        this.wallet = wallet;
    }
    async initialize() {
        this.state.address = this.wallet.address.toUserFriendlyAddress();
        await consensusEstablished;
        const transactions = await nimiq.client.getTransactionsByAddress(this.wallet.address);
        // handle existing transactions (oldest first)
        const moves = transactions
            .filter(transaction => {
            const isMined = transaction.state === Nimiq.Client.TransactionState.MINED;
            const isConfirmed = transaction.state === Nimiq.Client.TransactionState.CONFIRMED;
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
        nimiq.client.addTransactionListener((transaction) => {
            console.log(transaction.sender.toUserFriendlyAddress(), transaction.state);
            const sender = transaction.sender.toUserFriendlyAddress();
            if ((sender === this.state.nextPlayer || !this.state.playerTwo) &&
                transaction.state === Nimiq.Client.TransactionState.PENDING) {
                // player has played, but transaction still pending
                this.state.lastMovePending = true;
                this.notify();
                return;
            }
            const isMined = transaction.state === Nimiq.Client.TransactionState.MINED;
            const isConfirmed = transaction.state === Nimiq.Client.TransactionState.CONFIRMED;
            if (!isMined && !isConfirmed) {
                return;
            }
            const move = this.convertTransactionToMove(transaction);
            this.addMove(move);
        }, [this.wallet.address]);
        // notify (in case there were no moves)
        this.notify();
    }
    addMove(move) {
        if (!this.isValidMove(move)) {
            // invalid move, we ignore it
            return;
        }
        console.log(move);
        this.state.lastMovePending = false;
        this.state.moves.push(move);
        this.handledHashes.push(move.hash);
        // initialize player if not done yet
        if (!this.state.playerOne) {
            this.state.playerOne = move.address;
        }
        else if (!this.state.playerTwo) {
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
    isValidMove(move) {
        console.log(move);
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
        if (move.field === Game.JOIN && this.state.playerOne === move.address) {
            // same player can't join twice
            return false;
        }
        if (move.field !== Game.JOIN && !this.state.playerTwo) {
            // can't start moves without both players
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
        const transaction = this.wallet.createTransaction(Nimiq.Address.fromUserFriendlyAddress(this.state.winner), account.balance - Game.FEE, Game.FEE, await nimiq.client.getHeadHeight());
        nimiq.client.sendTransaction(transaction);
    }
    async refund() {
        const account = await nimiq.client.getAccount(this.wallet.address);
        const share = Math.floor(account.balance / 2);
        const headHeight = await nimiq.client.getHeadHeight();
        // player 1
        const transaction1 = this.wallet.createTransaction(Nimiq.Address.fromUserFriendlyAddress(this.state.playerOne), share - Game.FEE, Game.FEE, headHeight);
        // player 2
        const transaction2 = this.wallet.createTransaction(Nimiq.Address.fromUserFriendlyAddress(this.state.playerTwo), account.balance - share - Game.FEE, Game.FEE, headHeight);
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
    convertTransactionToMove(transaction) {
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
    static async generate() {
        await nimiqLoaded;
        const wallet = Nimiq.Wallet.generate();
        return new Game(wallet);
    }
    static async fromUrlAddress(address) {
        await nimiqLoaded;
        const cleanKey = address.replace(/\=/g, '.');
        const buffer = Nimiq.BufferUtils.fromBase64Url(cleanKey);
        const wallet = Nimiq.Wallet.loadPlain(buffer);
        return new Game(wallet);
    }
}
Game.FEE = GlobalConfig.fee;
Game.JOIN = 'join';
Game.ALLOWED_MOVES = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3', Game.JOIN];

export { Game as G, Sign as S };
