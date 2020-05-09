import { r as registerInstance, c as getElement } from './p-f79c9434.js';
import { A as ActiveRouter } from './p-0843d316.js';

const RouteTitle = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titleSuffix = '';
        this.pageTitle = '';
    }
    updateDocumentTitle() {
        const el = this.el;
        if (el.ownerDocument) {
            el.ownerDocument.title = `${this.pageTitle}${this.titleSuffix || ''}`;
        }
    }
    componentWillLoad() {
        this.updateDocumentTitle();
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "pageTitle": ["updateDocumentTitle"]
    }; }
};
ActiveRouter.injectProps(RouteTitle, [
    'titleSuffix',
]);

export { RouteTitle as stencil_route_title };
