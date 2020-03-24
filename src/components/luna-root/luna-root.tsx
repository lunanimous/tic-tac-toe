import { Component, h, Host } from "@stencil/core";

@Component({
  tag: "luna-root"
})
export class LunaRoot {
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

        <main class="max-w-2xl mx-auto mt-12">
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="luna-home" exact={true} />
              <stencil-route url="/:game" component="luna-game" />
            </stencil-route-switch>
          </stencil-router>
        </main>
      </Host>
    );
  }
}
