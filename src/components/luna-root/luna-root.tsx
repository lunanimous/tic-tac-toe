import { Component, h, Host, State } from '@stencil/core';
import { nimiq } from '../../models/nimiq';

@Component({
  tag: 'luna-root'
})
export class LunaRoot {
  @State() isAuthenticated: boolean = false;

  async login() {
    const options = {
      appName: 'Tic Tac Toe'
    };

    const addressInfo = await nimiq.hub.chooseAddress(options);
    nimiq.user = addressInfo.address;

    this.isAuthenticated = true;
  }

  render() {
    return (
      <Host>
        <header class="max-w-4xl mx-auto mt-8">
          <div class="text-center">
            <a
              href="https://lunanimous.github.io"
              class="inline-flex p-2 text-2xl text-gray-600 font text-center"
            >
              <span>Lunanimous</span>
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                class="w-8 h-8 ml-2 -mr-8 text-yellow-500"
              >
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            </a>
          </div>
        </header>

        <section class="max-w-4xl mx-auto mt-12">
          <h2 class="text-center text-gray-800 text-4xl mt-4">Tic Tac Toe</h2>
        </section>

        {this.isAuthenticated ? (
          <main class="max-w-2xl mx-auto mt-12">
            <stencil-router root="/tic-tac-toe/">
              <stencil-route-switch scrollTopOffset={0}>
                <stencil-route url="/" component="luna-home" exact={true} />
                <stencil-route url="/:game" component="luna-game" />
              </stencil-route-switch>
            </stencil-router>
          </main>
        ) : (
          <main class="max-w-2xl mx-auto mt-12">
            <div class="text-center p-8">
              <p class="mb-6">Login is required to play Tic Tac Toe</p>
              <button
                onClick={() => {
                  this.login();
                }}
                type="button"
                class="button bg-indigo-700 hover:bg-indigo-800 text-white focus:outline-none focus:shadow-outline px-6 py-2"
              >
                Login
              </button>
            </div>
          </main>
        )}

        <footer class="max-w-2xl mx-auto text-center mt-16 border-t">
          <p class="text-gray-500 mt-8">
            &copy; Lunanimous. All rights reserved.
          </p>
        </footer>
      </Host>
    );
  }
}
