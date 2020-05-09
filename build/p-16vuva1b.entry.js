import { r as registerInstance, e as createEvent, h, H as Host, c as getElement } from './p-f79c9434.js';
import './p-093b16dd.js';
import { m as matchPath, q as isModifiedEvent } from './p-aa67fb06.js';
import { A as ActiveRouter } from './p-0843d316.js';
import { S as Sign } from './p-46fe3ca2.js';

const LunaField = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.middle = false;
        this.value = Sign.Empty;
        this.fieldSelected = createEvent(this, "fieldSelected", 7);
    }
    getClasses() {
        let classes = 'inline-flex items-center justify-center w-24 h-24 appearance-none border-indigo-800 focus:outline-none';
        if (this.middle) {
            classes += ' border-r-2 border-l-2';
        }
        if (this.value === Sign.Circle) {
            classes += ' text-indigo-800 cursor-not-allowed';
        }
        else if (this.value === Sign.Cross) {
            classes += ' text-yellow-500 cursor-not-allowed';
        }
        else {
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
            return (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", class: 'w-12 h-12' }, h("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), h("line", { x1: "6", y1: "6", x2: "18", y2: "18" })));
        }
        if (this.value === Sign.Circle || this.value === Sign.SimCircle) {
            return (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", class: 'w-12 h-12' }, h("circle", { cx: "12", cy: "12", r: "9" })));
        }
        return h("div", { class: 'w-12 h-12' });
    }
    render() {
        return (h(Host, { class: "block" }, h("button", { onClick: () => this.fieldSelected.emit(this.name), disabled: this.value === Sign.Circle || this.value === Sign.Cross, type: "button", class: this.getClasses() }, this.getSign())));
    }
};

const getUrl = (url, root) => {
    // Don't allow double slashes
    if (url.charAt(0) == '/' && root.charAt(root.length - 1) == '/') {
        return root.slice(0, root.length - 1) + url;
    }
    return root + url;
};
const RouteLink = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.unsubscribe = () => { return; };
        this.activeClass = 'link-active';
        this.exact = false;
        this.strict = true;
        /**
          *  Custom tag to use instead of an anchor
          */
        this.custom = 'a';
        this.match = null;
    }
    componentWillLoad() {
        this.computeMatch();
    }
    // Identify if the current route is a match.
    computeMatch() {
        if (this.location) {
            this.match = matchPath(this.location.pathname, {
                path: this.urlMatch || this.url,
                exact: this.exact,
                strict: this.strict
            });
        }
    }
    handleClick(e) {
        if (isModifiedEvent(e) || !this.history || !this.url || !this.root) {
            return;
        }
        e.preventDefault();
        return this.history.push(getUrl(this.url, this.root));
    }
    // Get the URL for this route link without the root from the router
    render() {
        let anchorAttributes = {
            class: {
                [this.activeClass]: this.match !== null,
            },
            onClick: this.handleClick.bind(this)
        };
        if (this.anchorClass) {
            anchorAttributes.class[this.anchorClass] = true;
        }
        if (this.custom === 'a') {
            anchorAttributes = Object.assign({}, anchorAttributes, { href: this.url, title: this.anchorTitle, role: this.anchorRole, tabindex: this.anchorTabIndex, 'aria-haspopup': this.ariaHaspopup, id: this.anchorId, 'aria-posinset': this.ariaPosinset, 'aria-setsize': this.ariaSetsize, 'aria-label': this.ariaLabel });
        }
        return (h(this.custom, Object.assign({}, anchorAttributes), h("slot", null)));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "location": ["computeMatch"]
    }; }
};
ActiveRouter.injectProps(RouteLink, [
    'history',
    'location',
    'root'
]);

export { LunaField as luna_field, RouteLink as stencil_route_link };
