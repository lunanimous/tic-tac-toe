import { r as registerInstance, h } from './p-f79c9434.js';

class Iqons{static async svg(t){const e=makeHash(t);return this._svgTemplate(e[0],e[2],e[3]+e[4],e[5]+e[6],e[7]+e[8],e[9]+e[10],e[11])}static async render(t,e){e.innerHTML=await this.svg(t);}static async toDataUrl(t){return `data:image/svg+xml;base64,${this._btoa(await this.svg(t,!0))}`}static placeholder(t="#bbb",e=1){return `<svg viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/2000/xlink" >\n<path fill="none" stroke="${t}" stroke-width="${2*e}" transform="translate(0, 8) scale(0.5)" d="M251.6 17.34l63.53 110.03c5.72 9.9 5.72 22.1 0 32L251.6 269.4c-5.7 9.9-16.27 16-27.7 16H96.83c-11.43 0-22-6.1-27.7-16L5.6 159.37c-5.7-9.9-5.7-22.1 0-32L69.14 17.34c5.72-9.9 16.28-16 27.7-16H223.9c11.43 0 22 6.1 27.7 16z"/>\n<g transform="scale(0.9) translate(9, 8)">\n<circle cx="80" cy="80" r="40" fill="none" stroke="${t}" stroke-width="${e}" opacity=".9"></circle>\n<g opacity=".1" fill="#010101"><path d="M119.21,80a39.46,39.46,0,0,1-67.13,28.13c10.36,2.33,36,3,49.82-14.28,10.39-12.47,8.31-33.23,4.16-43.26A39.35,39.35,0,0,1,119.21,80Z"/></g>\n</g></svg>`}static renderPlaceholder(t,e,s){t.innerHTML=this.placeholder(e,s);}static placeholderToDataUrl(t,e){return `data:image/svg+xml;base64,${this._btoa(this.placeholder(t,e))}`}static async image(t){const e=await this.toDataUrl(t),s=await this._loadImage(e);return s.style.width="100%",s.style.height="100%",s}static async _svgTemplate(t,e,s,a,n,i,r){return this._$svg(await this._$iqons(t,e,s,a,n,i,r))}static async _$iqons(t,e,s,a,n,i,r){const o=hashToRGB(t,e,r);return t=o.main,e=o.background,`<g color="${t}" fill="${r=o.accent}">\n<rect fill="${e}" x="0" y="0" width="160" height="160"></rect>\n<circle cx="80" cy="80" r="40" fill="${t}"></circle>\n<g opacity=".1" fill="#010101"><path d="M119.21,80a39.46,39.46,0,0,1-67.13,28.13c10.36,2.33,36,3,49.82-14.28,10.39-12.47,8.31-33.23,4.16-43.26A39.35,39.35,0,0,1,119.21,80Z"/></g>\n${await this._generatePart("top",a)}\n${await this._generatePart("side",n)}\n${await this._generatePart("face",s)}\n${await this._generatePart("bottom",i)}\n</g>`}static _$svg(t){const e=this._getRandomId();return `<svg viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/2000/xlink" >\n<defs><clipPath id="hexagon-clip-${e}">\n<path d="M251.6 17.34l63.53 110.03c5.72 9.9 5.72 22.1 0 32L251.6 269.4c-5.7 9.9-16.27 16-27.7 16H96.83c-11.43 0-22-6.1-27.7-16L5.6 159.37c-5.7-9.9-5.7-22.1 0-32L69.14 17.34c5.72-9.9 16.28-16 27.7-16H223.9c11.43 0 22 6.1 27.7 16z" transform="scale(0.5) translate(0, 16)"/>\n</clipPath></defs>\n<g clip-path="url(#hexagon-clip-${e})">\n${t}\n</g></svg>`}static async _generatePart(t,e){const s=await this._getAssets(),a=t+"_"+this._assetIndex(e,t),n=s.getElementById(a);return n?n.innerHTML:""}static _loadImage(t){return new Promise((e,s)=>{const a=document.createElement("img");a.addEventListener("load",t=>e(a),{once:!0}),a.src=t;})}static async _getAssets(){return this._assetsPromise||(this._assetsPromise=new Promise(async function(t){let e;e="undefined"!=typeof IqonsAssets?IqonsAssets:await fetch(self.NIMIQ_IQONS_SVG_PATH||Iqons.svgPath).then(t=>t.text()),"undefined"!=typeof module&&module.exports&&(global.DOMParser=require("dom-parser")),t((new DOMParser).parseFromString(e,"image/svg+xml"));}))}static _btoa(t){return "undefined"!=typeof module&&module.exports?new Buffer(t).toString("base64"):btoa(t)}static _assetIndex(t,e){return (t=Number(t)%Iqons.ASSET_COUNTS[e]+1)<10&&(t="0"+t),t}static _getRandomId(){return Math.floor(256*Math.random())}}
// @asset(/node_modules/@nimiq/iqons/dist/iqons.min.svg);
Iqons.svgPath="/node_modules/@nimiq/iqons/dist/iqons.min.svg",Iqons.ASSET_COUNTS={top:21,side:21,face:21,bottom:21};
function makeHash(t){const r=(""+t.split("").map(t=>Number(t.charCodeAt(0))+3).reduce((t,r)=>t*(1-t)*__chaosHash(r),.5)).split("").reduce((t,r)=>r+t,"");return _padEnd(r.replace(".",r[5]).substr(4,17),13,r[5])}function __chaosHash(t){let r=1/t;for(let t=0;t<100;t++)r=(1-r)*r*3.569956786876;return r}function _padEnd(t,r,e){if(String.prototype.padEnd)return t.padEnd(r,e);for(;t.length<r;)t+=e;return t.substring(0,Math.max(t.length,r))}
function hashToRGB(o,n,r){return indicesToRGB(hashToIndices(o,n,r))}function hashToIndices(o,n,r){for(o=parseInt(o,10),n=parseInt(n,10),r=parseInt(r,10),o===n&&++o>9&&(o=0);r===o||r===n;)++r>9&&(r=0);return {main:o,background:n,accent:r}}function indicesToRGB(o){return {main:colors[o.main],background:backgroundColors[o.background],accent:colors[o.accent]}}const colors=["#FC8702","#D94432","#E9B213","#1A5493","#0582CA","#5961A8","#21BCA5","#FA7268","#88B04B","#795548"];const backgroundColors=["#FC8702","#D94432","#E9B213","#1F2348","#0582CA","#5F4B8B","#21BCA5","#FA7268","#88B04B","#795548"];

const LunaPlayer = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._address = null;
    }
    onAddressChanged() {
        this.update();
    }
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
        return (h("div", { class: "flex items-center justify-center", "aria-label": this.address ? this.address : 'No player yet', "data-microtip-position": "top", role: "tooltip" }, h("img", { src: this._iqon, class: "w-16 h-16" })));
    }
    static get watchers() { return {
        "address": ["onAddressChanged"]
    }; }
};

export { LunaPlayer as luna_player };
