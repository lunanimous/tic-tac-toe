import { Component, h, Prop, State, Listen } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import Nimiq, { Client, ClientNetwork, Wallet } from '@nimiq/core-web';
import HubApi from '@nimiq/hub-api';

@Component({
  tag: 'luna-game'
})
export class LunaGame {
  client: Client;
  network: ClientNetwork;
  hub: HubApi;
  wallet: Wallet = null;

  @Prop() match: MatchResults;

  @State() address: string = '';
  @State() playerOne: string;
  @State() playerTwo: string;
  @State() fields = {
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
    const signedTransaction = await this.hub.checkout(options);
    console.log(signedTransaction);
  }

  async componentWillLoad() {
    let _address;
    if (this.match && this.match.params && this.match.params.game) {
      _address = this.match.params.game;
    } else {
      _address = null;
    }

    // start hub api
    this.hub = new HubApi('https://hub.nimiq-testnet.com');

    // start nimiq consensus
    const workerUrl = location.origin + '/workers/';
    await Nimiq.load(workerUrl);

    this.startConsensus();

    this.wallet = this.parseGameAddress(_address);
    this.address = this.wallet.address.toUserFriendlyAddress();

    this.client.addTransactionListener(
      async transaction => {
        console.log(transaction);
        const isPlayerOne =
          transaction.sender.toUserFriendlyAddress() === this.playerOne;
        const isPlayerTwo =
          transaction.sender.toUserFriendlyAddress() === this.playerTwo;

        const move = {};
        const field = Nimiq.BufferUtils.toAscii(transaction.data.raw);
        move[field] = isPlayerOne ? 1 : isPlayerTwo ? 2 : 0;

        this.fields = Object.assign({}, this.fields, move);
      },
      [this.wallet.address]
    );

    await this.client.waitForConsensusEstablished();

    const transactions = await this.client.getTransactionsByAddress(
      this.address
    );

    // build activity
    console.log(transactions);
    let moves = [];

    const sorted = transactions.sort((t1, t2) => t1.timestamp - t2.timestamp);

    sorted.forEach(transaction => {
      if (!this.playerOne) {
        this.playerOne = transaction.sender.toUserFriendlyAddress();
      } else if (!this.playerTwo) {
        this.playerTwo = transaction.sender.toUserFriendlyAddress();
      }

      const isPlayerOne =
        transaction.sender.toUserFriendlyAddress() === this.playerOne;
      const isPlayerTwo =
        transaction.sender.toUserFriendlyAddress() === this.playerTwo;

      const move = {};
      const field = Nimiq.BufferUtils.toAscii(transaction.data.raw);
      move[field] = isPlayerOne ? 1 : isPlayerTwo ? 2 : 0;

      moves.push(move);
    });

    moves.forEach(move => {
      console.log(move);
      this.fields = Object.assign({}, this.fields, move);
    });
  }

  async startConsensus() {
    console.log('Nimiq loaded. Establishing consensus...');

    // Code from 'Getting started'
    Nimiq.GenesisConfig.test();
    const configBuilder = Nimiq.Client.Configuration.builder();
    const client = configBuilder.instantiateClient();

    this.client = client;
    this.network = client.network;

    console.log('Syncing and establishing consensus...');

    // Can be 'syncing', 'established', and 'lost'
    this.client.addConsensusChangedListener(consensus =>
      console.log(`Consensus: ${consensus}`)
    );

    this.client.addHeadChangedListener(async () => {
      console.log('head changed');
      const height = await this.client.getHeadHeight();
      console.log(height);
    });
  }

  parseGameAddress(address: string) {
    if (!address || address.length === 0) {
      return null;
    }

    const cleanKey = address.replace(/\=/g, '.');
    const buffer = Nimiq.BufferUtils.fromBase64Url(cleanKey);
    const wallet = Nimiq.Wallet.loadPlain(buffer);
    console.log(wallet.address.toUserFriendlyAddress());

    return wallet;
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
              <luna-field name={'a1'} value={this.fields['a1']}></luna-field>
              <luna-field
                name={'a2'}
                value={this.fields['a2']}
                middle={true}
              ></luna-field>
              <luna-field name={'a3'} value={this.fields['a3']}></luna-field>
            </div>
            <div class="flex border-t-2 border-b-2 border-indigo-800">
              <luna-field name={'b1'} value={this.fields['b1']}></luna-field>
              <luna-field
                name={'b2'}
                value={this.fields['b2']}
                middle={true}
              ></luna-field>
              <luna-field name={'b3'} value={this.fields['b3']}></luna-field>
            </div>
            <div class="flex">
              <luna-field name={'c1'} value={this.fields['c1']}></luna-field>
              <luna-field
                name={'c2'}
                value={this.fields['c2']}
                middle={true}
              ></luna-field>
              <luna-field name={'c3'} value={this.fields['c3']}></luna-field>
            </div>
          </div>
        </div>

        <p>{this.address}</p>
      </div>
    );
  }
}
