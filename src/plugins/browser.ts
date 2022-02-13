export function supportsDragAndDrop() {
    const div = document.createElement('div');

    const isDraggable = ( ( 'draggable' in div )
        || ( 'ondragstart' in div && 'ondrop' in div ) )
        && 'FormData' in window
        && 'FileReader' in window;

    div.remove();

    return isDraggable;
}
