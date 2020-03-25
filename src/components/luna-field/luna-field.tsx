import { Component, h, Prop, Host, Event } from '@stencil/core';
import { EventEmitter } from '@stencil/router/dist/types/stencil.core';

@Component({
  tag: 'luna-field'
})
export class LunaField {
  @Prop() middle = false;
  @Prop() name: string;
  @Prop() value = 0;

  @Event() fieldSelected: EventEmitter;

  getClasses() {
    let classes =
      'inline-flex items-center justify-center w-24 h-24 appearance-none border-indigo-800 focus:outline-none';

    if (this.middle) {
      classes += ' border-r-2 border-l-2';
    }

    if (this.value === 2) {
      classes += ' text-indigo-800';
    } else if (this.value === 1) {
      classes += ' text-yellow-500';
    } else {
      classes += ' text-gray-200 hover:text-gray-400';
    }

    if (this.value !== 0) {
      classes += ' cursor-not-allowed';
    }

    return classes;
  }

  getColor() {
    if (this.value === 2) {
      return 'text-indigo-800';
    }

    if (this.value === 1) {
      return 'text-yellow-500';
    }

    return 'text-gray-200';
  }

  render() {
    return (
      <Host class="block">
        <button
          onClick={() => this.fieldSelected.emit(this.name)}
          disabled={this.value !== 0}
          type="button"
          class={this.getClasses()}
        >
          <svg viewBox="0 0 27 24" class={'w-12 h-12'}>
            <path
              d="M26.6991 10.875L21.0741 1.125C20.6691 0.4275 19.9266 0 19.1241 0H7.87414C7.07164 0 6.32914 0.4275 5.92789 1.125L0.302891 10.875C-0.0983594 11.5725 -0.0983594 12.4275 0.302891 13.125L5.92789 22.875C6.32914 23.5725 7.07164 24 7.87414 24H19.1241C19.9266 24 20.6691 23.5725 21.0704 22.875L26.6954 13.125C27.1004 12.4275 27.1004 11.5725 26.6991 10.875Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </Host>
    );
  }
}
