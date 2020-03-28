import { Component, h, Prop, Host, Event } from '@stencil/core';
import { EventEmitter } from '@stencil/router/dist/types/stencil.core';
import { Sign } from '../../models/game';

@Component({
  tag: 'luna-field'
})
export class LunaField {
  @Prop() middle = false;
  @Prop() name: string;
  @Prop() value: Sign = Sign.Empty;

  @Event() fieldSelected: EventEmitter;

  getClasses() {
    let classes =
      'inline-flex items-center justify-center w-24 h-24 appearance-none border-indigo-800 focus:outline-none';

    if (this.middle) {
      classes += ' border-r-2 border-l-2';
    }

    if (this.value === Sign.Circle) {
      classes += ' text-indigo-800 cursor-not-allowed';
    } else if (this.value === Sign.Cross) {
      classes += ' text-yellow-500 cursor-not-allowed';
    } else {
      classes += ' text-gray-200 hover:text-gray-400';
    }

    return classes;
  }

  getColor() {
    if (this.value === Sign.Circle) {
      return 'text-indigo-800';
    }

    if (this.value === Sign.Cross) {
      return 'text-yellow-500';
    }

    return 'text-gray-200';
  }

  getSign() {
    if (this.value === Sign.Cross || this.value === Sign.SimCross) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class={'w-12 h-12'}
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      );
    }

    if (this.value === Sign.Circle || this.value === Sign.SimCircle) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class={'w-12 h-12'}
        >
          <circle cx="12" cy="12" r="9"></circle>
        </svg>
      );
    }

    return <div class={'w-12 h-12'}></div>;
  }

  render() {
    return (
      <Host class="block">
        <button
          onClick={() => this.fieldSelected.emit(this.name)}
          disabled={this.value === Sign.Circle || this.value === Sign.Cross}
          type="button"
          class={this.getClasses()}
        >
          {this.getSign()}
        </button>
      </Host>
    );
  }
}
