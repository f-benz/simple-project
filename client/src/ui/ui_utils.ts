export function insertAfter(htmlObject: HTMLElement, toInsert: HTMLElement) {
    let parent = htmlObject.parentNode;
    let next = htmlObject.nextSibling;
    if (next == null) {
        parent.appendChild(toInsert);
    } else {
        parent.insertBefore(toInsert, next);
    }
}

export function remove(toRemove: HTMLElement) {
    toRemove.parentNode.removeChild(toRemove);
}