export function getElement(selector: string): HTMLElement {
    return document.querySelector(selector) as HTMLElement
}

export function getInputElement(selector: string): HTMLInputElement {
    return getElement(selector) as HTMLInputElement
}

export function getSelectElement(selector: string): HTMLSelectElement {
    return getElement(selector) as HTMLSelectElement
}
