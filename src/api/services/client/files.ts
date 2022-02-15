import { Parser } from '~/api';
import RequestService from './request';

export interface FileRequest {
    path: string;
}

export interface FileContents {
    content: string;
}

export interface WriteFileRequest extends FileRequest {
    content: string;
}

export interface ManageFilesRequest {
    paths: string[];
}

export interface DownloadFileResponse {
    url: string;
}

export interface RenameFileRequest extends FileRequest {
    name: string;
}

export interface CompressFilesRequest extends ManageFilesRequest {
    to: string;
}

class FilesService {
    getDirectory(req: PaginatableRequest, path: string) {
        return RequestService.get('/servers/:server/files/directory', {
            path,
            ...req,
        })
            .then(Parser.parse);
    }

    createDirectory(data: FileRequest) {
        return RequestService.post('/servers/:server/files/directory', data);
    }

    readFile(data: FileRequest) {
        return RequestService.get('/servers/:server/files/read', data);
    }

    writeFile(data: WriteFileRequest) {
        return RequestService.post('/servers/:server/files/write', data);
    }

    copyFile(data: FileRequest) {
        return RequestService.post('/servers/:server/files/copy', data);
    }

    deleteFile(data: ManageFilesRequest) {
        return RequestService.post('/servers/:server/files/delete', data);
    }

    downloadFile(data: FileRequest): Promise<DownloadFileResponse> {
        return RequestService.get('/servers/:server/files/download', data);
    }

    renameFile(data: RenameFileRequest) {
        return RequestService.patch('/servers/:server/files/rename', data);
    }

    compressFile(data: CompressFilesRequest) {
        return RequestService.post('/servers/:server/files/compress', data);
    }

    decompressFile(data: FileRequest) {
        return RequestService.post('/servers/:server/files/decompress', data);
    }
}

export default new FilesService();
