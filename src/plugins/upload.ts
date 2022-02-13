import { ref } from 'vue';
import { state, dispatch } from '~/core';
import DaemonWrapper from '~/api/services/daemon/wrapper';
import { onModelLoaded } from '~/plugins';

interface PendingFile {
    name: string;
    uploaded_size: number;
    size: number;

    // Folder-specific information
    uploaded_files?: number;
    files?: number;
}

type FileWithMetadata = File & { meta?: Record<string, any> };

const CONCURRENT_UPLOADS = 5;
const uploadQueue: FileWithMetadata[] = [];
onModelLoaded('server', () => {
    uploadQueue.splice(0, uploadQueue.length);
});

export const pendingFiles = ref<Record<string, PendingFile>>({});

function handleWebkitEntry(entry: any, parent: string, path: string): Promise<PendingFile> {
    if (entry.isFile) {
        return new Promise((resolve, reject) => entry.file((file: FileWithMetadata) => {
            file.meta = Object.assign(file.meta || {}, {
                relativePath: (file as any).webkitRelativePath,
                parent,
                path,
            });

            uploadQueue.push(file);

            return resolve({
                name: file.name,
                size: file.size,
                uploaded_size: 0,
            });
        }, reject));
    } else {
        return new Promise(resolve => {
            entry.createReader().readEntries(async (entries: any[]) => {
                return resolve(
                    (
                        await Promise.all(
                            entries.map(entry => handleWebkitEntry(entry, parent, path))
                        )
                    ).reduce((prev, cur) => {
                        return {
                            name: entry.name,
                            size: prev.size + cur.size,
                            uploaded_size: 0,
                            files: (prev.files || 1) + (cur.files || 1),
                            uploaded_files: 0,
                        };
                    })
                );
            });
        });
    }
}

export async function handleUploadEvent(evt: Event, path: string) {
    const items = (evt as any).dataTransfer?.items || (evt as any).target?.files;
    if (!items) return;

    // TODO: at least on linux firefox, drag and dropping multiple folders (and maybe files?) only gives single item?
    // TODO: limit amount of *parent* items to 10 (or less?)
    for(const file of items) {
        const identifier = Math.random().toString(36).slice(2);
        const webkitEntry = file.webkitGetAsEntry?.() || (file as any).getAsEntry?.();
        if (webkitEntry) {
            // We want to put it as pending ASAP, so that the user knows something is happening.
            pendingFiles.value[identifier] = {
                name: webkitEntry.name,
                size: 0,
                uploaded_size: 0,
            };

            pendingFiles.value[identifier] = await handleWebkitEntry(webkitEntry, identifier, path);
        } else {
            const actualFile: FileWithMetadata = file instanceof File ? file : file.getAsFile();
            if (!actualFile) return; // Should we throw an error instead?

            actualFile.meta = Object.assign(actualFile.meta || {}, {
                parent: identifier,
                path,
            });

            pendingFiles.value[identifier] = {
                name: actualFile.name,
                size: actualFile.size,
                uploaded_size: 0,
            };

            uploadQueue.push(actualFile);
        }
    }

    DaemonWrapper.siofu?.submitFiles(uploadQueue.splice(0, CONCURRENT_UPLOADS));
}

function updateParentSize(file: any, uploaded: number) {
    const parentId = file.meta.parent;
    const parent = pendingFiles.value[parentId];
    if (parent) {
        if (file.meta.increased_size) {
            parent.uploaded_size -= file.meta.increased_size;
        }

        parent.uploaded_size += uploaded;
        file.meta.increased_size = uploaded;
    }
}

DaemonWrapper.registerEvent('upload-progress', evt => updateParentSize(evt.file, evt.bytesLoaded));

let onAllUploadsFinish: () => void | undefined;
export function setOnAllUploadsFinishCallback(callback: () => void) {
    onAllUploadsFinish = callback;
}

function handleFinishUpload(evt: any) {
    updateParentSize(evt.file, evt.file.size);

    const parentId = evt.file.meta.parent;
    const parent = pendingFiles.value[parentId];
    if (parent) {
        if (parent.uploaded_files !== undefined) {
            parent.uploaded_files++;
        }

        if (parent.size === parent.uploaded_size || parent.files === parent.uploaded_files) {
            delete pendingFiles.value[parentId];
        }
    }

    if (uploadQueue.length === 0) {
        onAllUploadsFinish?.();
    } else {
        DaemonWrapper.siofu?.submitFiles([uploadQueue.shift()]);
    }
}

DaemonWrapper.registerEvent('upload-complete', handleFinishUpload);
DaemonWrapper.registerEvent('upload-error', evt => {
    if (evt.code === 1 || evt.file?.size > (state.models.server?.node?.uploadSize || 100) * 1000 * 1000) {
        dispatch('alerts/add', {
            type: 'danger',
            title: ['server.files.upload_too_large', { name: evt.file.name }],
        });
    }

    handleFinishUpload(evt);
});

export function isAvailable() {
    return DaemonWrapper.siofu !== undefined;
}

// TODO: should this element be cleared?
let uploadElement: HTMLInputElement | undefined;
export function uploadPrompt(path: string) {
    if (isAvailable()) {
        if (!uploadElement) {
            uploadElement = document.createElement('input');
            uploadElement.setAttribute('type', 'file');
            uploadElement.style.display = 'none';

            document.body.appendChild(uploadElement);

            uploadElement.addEventListener('change', evt => {
                evt.preventDefault();

                handleUploadEvent(evt, path);
            });
        }

        const event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            0, null);

        uploadElement.dispatchEvent(event);
    }
}
