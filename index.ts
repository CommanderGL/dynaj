import { Reactive } from './state';

export * from './state';

/** Definition of DynajElem */
export type DynajData = {
    type?: keyof HTMLElementTagNameMap | ((data: DynajData, onInit: (cb: () => void) => void) => DynajElem | HTMLElement | DynajData),
    html?: string | Reactive,
    text?: string | Reactive,
    children?: (HTMLElement | DynajData | DynajElem)[],
    elem?: HTMLElement,
    parent?: HTMLElement | DynajData | DynajElem | string,
    attributes?: {[key: string]: string | Reactive},
    ref?: string,
    css?: Partial<CSSStyleDeclaration>
};

/** References to DynajElem's */
export const refs: {[key: string]: DynajElem} = {};

/** Converts any Dynaj or HTML Element type to DynajElem. */
export const asDynajElem = (elem: HTMLElement | DynajData | DynajElem | string) => {
    if (elem instanceof DynajElem) return elem;
    if (elem instanceof Element) return new DynajElem({ elem });
    if (typeof elem == 'string') return new DynajElem({
        elem: document.querySelector(elem) as HTMLElement
    });
    return new DynajElem(elem);
};

/** Converts any Dynaj or HTML Element type to native HTML Element. */
export const asHTMLElem = (elem: HTMLElement | DynajData | DynajElem | string) => {
    if (elem instanceof DynajElem) return elem.elem;
    if (elem instanceof Element) return elem;
    if (typeof elem == 'string') return document.querySelector(elem) as Element;
    return new DynajElem(elem).elem;
};

/** Parses reactive data if there is any. */
const parseReactive = (r: Reactive | any, de: DynajElem, addCb: boolean) => {
    if (r instanceof Reactive) {
        if (addCb) r._addChangeListener(de.render, de);
        return r.value;
    }

    return r;
};

export class DynajElem {
    elem: HTMLElement = document.createElement('div');
    data: DynajData;

    constructor(data: DynajData) {
        this.data = data;

        let componentInit: (() => void) | null = null;
        if (this.data.type != null) {
            if (typeof this.data.type == 'string') {
                this.elem = document.createElement(this.data.type);
            } else {
                const componentReturn = this.data.type(this.data, (cb) => componentInit = cb);

                if (componentReturn instanceof Element) {
                    this.elem = componentReturn;
                } else if (componentReturn instanceof DynajElem) {
                    Object.assign(this.data, componentReturn.data);
                } else {
                    Object.assign(this.data, componentReturn);
                }

                if (typeof this.data.type == 'string') this.elem = document.createElement(this.data.type);
            }
        }

        if (this.data.elem != null)
            this.elem = this.data.elem;

        if (this.data.children != null) this.data.children.forEach(child => {
            this.elem.appendChild(asHTMLElem(child));
        });

        if (this.data.parent != null) asHTMLElem(this.data.parent).appendChild(this.elem);

        if (this.data.ref != null) refs[this.data.ref] = this;

        this.render(this, true);

        if (componentInit != null) (componentInit as () => void)();
    }

    render(self: DynajElem, firstRun?: boolean) {
        if (self.data.html != null)
            self.elem.innerHTML = parseReactive(self.data.html, self, firstRun != null ? true : false);
        if (self.data.text != null)
            self.elem.textContent = parseReactive(self.data.text, self, firstRun != null ? true : false);

        if (self.data.attributes != null) {
            while (self.elem.attributes.length > 0) {
                self.elem.removeAttribute(self.elem.attributes[0].name);
            }

            if (this.data.css != null) Object.assign(this.elem.style, this.data.css);

            Object.entries(self.data.attributes).forEach(([key, value]) => {
                self.elem.setAttribute(key, parseReactive(value, self, firstRun != null ? true : false));
            });
        }
    }

    /** innerHTML */
    get html() {
        return this.elem.innerHTML as string;
    }

    /** innerHTML */
    set html(value: string | Reactive) {
        this.data.html = value;

        this.render(this);
    }

    /** textContent */
    get text() {
        return this.elem.textContent as string;
    }

    /** textContent */
    set text(value: string | Reactive) {
        this.data.text = value;

        this.render(this);
    }

    /** Set's the elements attribute */
    setAttribute(name: string, value: string | Reactive) {
        (this.data.attributes as {[key: string]: string | Reactive})[name] = value;

        this.render(this);

        return this;
    }

    /** Shorthand for adding an event handler */
    addEvent(type: string, cb: (() => void) | ((e: Event) => void)) {
        this.elem.addEventListener(type, cb);

        return this;
    }
}