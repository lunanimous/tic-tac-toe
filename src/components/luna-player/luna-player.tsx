import { Component, h, Prop, State, Watch } from '@stencil/core';
import Iqons from '@nimiq/iqons';

@Component({
  tag: 'luna-player'
})
export class LunaPlayer {
  @Prop() address: string;
  @Watch('address')
  onAddressChanged() {
    this.update();
  }

  @State() _address: string[] = null;
  @State() _iqon: string;

  componentWillLoad() {
    this.update();
  }

  async update() {
    if (!this.address || this.address.length === 0) {
      this._address = null;
      this._iqon = Iqons.placeholderToDataUrl('#bbb', 1);
      return;
    }

    this._iqon = await Iqons.toDataUrl(this.address);
    this._address = this.address.split(' ');
  }

  render() {
    return (
      <div
        class="flex items-center justify-center"
        aria-label={this.address ? this.address : 'No player yet'}
        data-microtip-position="top"
        role="tooltip"
      >
        <img src={this._iqon} class="w-16 h-16" />

        {/* {this._address ? (
          <div
            class="hidden sm:flex flex-wrap max-w-sm leading-tight font-mono text-gray-500 tracking-wide"
            style={{ 'max-width': '10rem' }}
          >
            {this._address.map(part => (
              <p class="w-1/3">{part}</p>
            ))}
          </div>
        ) : (
          <p class="flex flex-1 items-center text-gray-600">No player yet</p>
        )} */}
      </div>
    );
  }
}
