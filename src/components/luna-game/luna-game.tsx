import { Component, h, Prop, State } from "@stencil/core";
import { MatchResults } from "@stencil/router";

@Component({
  tag: "luna-game"
})
export class LunaGame {
  @Prop() match: MatchResults;

  @State() game: string = null;

  componentWillLoad() {
    let game;
    if (this.match && this.match.params && this.match.params.game) {
      game = this.match.params.game;
    } else {
      game = null;
    }

    if (this.isValidGame(game)) {
      this.game = game;
    }
  }

  isValidGame(game: string) {
    debugger;
    if (!game || game.length === 0) {
      return false;
    }

    return true;
  }

  render() {
    if (this.game) {
      return <p>{this.game}</p>;
    } else {
      return <p>Bad game</p>;
    }
  }
}
