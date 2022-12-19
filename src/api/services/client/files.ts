import { Parser } from '~/api';
import RequestService from './request';

export interface CreateDirectoryRequest {
    root: string;
    name: string;
}

export interface ReadFileRequest {
    path: string;
}

export interface ReadFileResponse {
    content: string;
}

export interface WriteFileRequest {
    path: string;
    content: string;
}

export interface CopyFileRequest {
    path: string;
}

export interface DownloadFileRequest {
    path: string;
}

export interface DownloadFileResponse {
    url: string;
}

export interface DeleteFilesRequest {
    root: string;
    files: string[];
}

export interface RenameFileRequest {
    root: string;
    from: string;
    to: string;
}

export interface CompressFilesRequest {
    root: string;
    files: string[];
}

export interface DecompressFilesRequest {
    root: string;
    file: string;
}

class FilesService {
    getDirectory(req: PaginatableRequest, path: string) {
        return RequestService.get('/servers/:server/files/directory', {
            path,
            ...req,
        })
            .then(Parser.parse);
    }

    createDirectory(data: CreateDirectoryRequest) {
        return RequestService.post('/servers/:server/files/directory', data);
    }

    readFile(data: ReadFileRequest) {
        return RequestService.get('/servers/:server/files/read', data);
    }

    writeFile(data: WriteFileRequest) {
        return RequestService.post('/servers/:server/files/write', data);
    }

    copyFile(data: CopyFileRequest) {
        return RequestService.post('/servers/:server/files/copy', data);
    }

    deleteFile(data: DeleteFilesRequest) {
        return RequestService.post('/servers/:server/files/delete', data);
    }

    downloadFile(data: DownloadFileRequest): Promise<DownloadFileResponse> {
        return RequestService.get('/servers/:server/files/download', data);
    }

    renameFile(data: RenameFileRequest) {
        return RequestService.patch('/servers/:server/files/rename', data);
    }

    compressFile(data: CompressFilesRequest) {
        return RequestService.post('/servers/:server/files/compress', data, {
            timeout: 60000,
        });
    }

    decompressFile(data: DecompressFilesRequest) {
        return RequestService.post('/servers/:server/files/decompress', data, {
            timeout: 60000,
        });
    }
}

export default new FilesService();
