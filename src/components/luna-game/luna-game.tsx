import { Component, h, Prop, State, Listen } from '@stencil/core';
import { MatchResults } from '@stencil/router';

@Component({
  tag: 'luna-game'
})
export class LunaGame {
  @Prop() match: MatchResults;

  @State() address: string = null;
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
  onFieldSelected(event) {
    console.log(event.detail);
  }

  componentWillLoad() {
    let _address;
    if (this.match && this.match.params && this.match.params.game) {
      _address = this.match.params.game;
    } else {
      _address = null;
    }

    if (this.isValidGame(_address)) {
      this.address = _address;
    }
  }

  isValidGame(address: string) {
    if (!address || address.length === 0) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <div class="relative bg-white rounded-md mt-4 p-4 shadow-lg">
        <div class="flex w-full items-center">
          <luna-player class="flex-1" address={''}></luna-player>
          <div class="flex flex-none items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-800 font-bold mx-8">
            vs
          </div>
          <luna-player class="flex-1" address={''}></luna-player>
        </div>

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
      </div>
    );
  }
}
