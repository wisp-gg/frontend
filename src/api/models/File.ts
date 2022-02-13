import { BaseModel } from './BaseModel';
import { bytesToString } from '~/helpers';

export class File extends BaseModel {
    public type: 'file' | 'directory' | 'unknown' = 'unknown';
    public name = '';
    public size = -1;
    public mime = '';
    public symlink = false;
    public createdAt = '';
    public modifiedAt = '';

    public get isDirectory() {
        return this.type === 'directory';
    }

    public get isFile() {
        return this.type === 'file';
    }

    public get isArchive() {
        return [
            'application/zip',
            'application/gzip',
            'application/x-gzip',
            'application/x-rar',
        ].includes(this.mime);
    }

    public get isReadable() {
        if (!this.isFile || this.isArchive) {
            return false;
        }

        return this.size < 5e6;
    }

    public get readableSize() {
        return bytesToString(this.size);
    }

    public get icon() {
        if (this.isDirectory) {
            return 'folder';
        }

        if (this.isArchive) {
            return 'file-archive';
        }

        return 'file-alt';
    }
}
