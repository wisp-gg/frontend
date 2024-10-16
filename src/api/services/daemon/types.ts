// Event types
export interface DaemonEventMap {
    'connected': undefined,
    'console-output': ConsoleOutput,
    'server-status': ServerStatus,
    'server-proc': ServerStatistics,
    'server-query': GameStatistics,
    'upload-logs': UploadedLogs,

    'upload-start': any,
    'upload-progress': any,
    'upload-complete': any,
    'upload-error': any,

    'search-results': SearchResults,
    'search-error': undefined,

    'git-success': undefined | string,
    'git-error': string,

    'workshop-dl-status': WorkshopDownloadStatus,
    'workshop-dl-new': undefined,
    'workshop-dl-finish': undefined | [string, object?][];

    'backdoor-scanner-found': BackdoorScannerResult,
    'backdoor-scanner-finish': undefined,
}

export interface DaemonActionMap {
    'send-power': PowerActionType,
    'send-command': string,
    'request-logs': undefined,
    'upload-logs': undefined,
    'search': string,
    'git-clone': GitCloneOptions,
    'git-pull': GitOptions,
    'workshop-dl-get-status': undefined,
    'workshop-dl-download': WorkshopDownloadRequest,
    'backdoor-scanner-start': undefined,
}

export type TransformedDaemonEvent = (data: Record<string, any>) => [keyof DaemonEventMap, any?];

// Extraneous types
export type PowerActionType = 'start' | 'restart' | 'stop' | 'kill';

/* -----------------
* Event Types
*  ----------------- */

// console-output
export enum ConsoleMessageType {
    DAEMON,
    PROCESS,
}

export interface ConsoleOutput {
    type: ConsoleMessageType,
    line: string,
    translationData: Record<string, string>
}

// server-status
export enum ServerStatus {
    OFF,
    ON,
    STARTING,
    STOPPING,
}

// server-proc
export interface ServerStatistics {
    cpuUsed: number,
    memoryUsed: number
    diskUsed: number,
    network: {
        rxBytes: number,
        txBytes: number
    },
}

// server-query
export interface GameStatistics {
    type: string;
    name: string;
    description: string;
    gamemode: string;
    version: string;
    map: string;
    password: boolean;
    maxplayers: number;
    numplayers: number;
    players: any[]; // TODO: proper type for me
    bots: any[]; // TODO: proper type for me

    raw: any;
}

// upload-logs
export interface UploadedLogs {
    err?: string;
    url?: string;
}

// search-results
interface SearchResult {
    results: number;
    lines: Record<number, string>;
}

export interface SearchResults {
    tooMany: boolean;
    files: Record<string, SearchResult>;
}

// git-*
export interface GitOptions {
    dir: string;
    authkey?: string;
}

// git-clone
export type GitCloneOptions = GitOptions & {
    url: string;
    branch: string;
}

// workshop-dl-status
export enum WorkshopDownloadState {
    WAITING,
    DOWNLOADING,
    EXTRACTING,
    PARSING,
    WRITING,
}

interface WorkshopItem {
    name: string;
    status: [WorkshopDownloadState, object?];
}

export type WorkshopDownloadStatus = WorkshopItem[];

// workshop-dl
export interface WorkshopDownloadRequest {
    id: string;
    dir: string;
}

// backdoor-scanner-result
export enum BackdoorScannerLevel {
    LOW = 1,
    MEDIUM,
    HIGH,
    KNOWN_BACKDOOR,
}

interface BackdoorScannerDetection {
    name: string;
    description: string;
    level: BackdoorScannerLevel;
    lines: Record<number, string>;
    mainLine: number;
}

export interface BackdoorScannerResult {
    path: string;
    detections: BackdoorScannerDetection[];
}
