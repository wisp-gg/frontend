// TODO: clean me up into src/types/, possibly introduce namespaces?

declare module '*.svg';
declare module '*.jpg';
declare module '*.png';
declare module '*.mp3';

// VueJS
declare module '*.vue' {
    import { defineComponent } from 'vue';

    const Component: ReturnType<typeof defineComponent>;
    export default Component;
}

// Locales
declare module '*.json' {
    const value: any;
    export default value;
}

// Custom
interface ImportEnv {
    // Always declared by vite
    MODE: string;
    BASE_URL: string;
    PROD: boolean;
    DEV: boolean;

    // Our custom .env values
    VITE_PANEL_URL?: string;
    VITE_HTTP_DELAY?: number;
}

interface ImportMeta {
    env: ImportEnv,
}

interface FrontendConfiguration {
    Debug?: boolean; // Debug prints in console

    Node: string;
    Version: string;

    BaseURL: string;
}

// eslint-disable-next-line no-var
declare var Wisp: FrontendConfiguration;

type RootState = import('~/store').RootState;

type TranslatableMessage = [string, any?];

// Validator
type ValidationRule = (value: any, input?: any) => { valid: boolean; normalized?: any; };
type ValidationRules = Record<string, ValidationRule>;

interface ValidatedResponse {
    errors?: TranslatableMessage[];
    normalized?: any;
}

// Form stuff
type registerFormComponentFn = (data: FormComponent) => () => void;
type displayFormErrorsFn = () => void;
type submitFormFn = () => void;
interface FormComponent {
    key?: string;
    value?: import('vue').Ref;
    errors?: import('vue').Ref<TranslatableMessage[][] | null>;
    validate?: () => void;
    rule?: string;
    onSubmit?: (state: boolean) => void;
}

// List stuff
interface PaginatableRequest {
    search?: string;
    page?: number;
    perPage?: number;
}

type SupportedListFeatures = 'clipboard' | 'code' | 'secret';
type SupportedListFormats = 'none' | 'datetime' | 'size' | 'number';
interface ListField {
    key: string;
    label?: string;
    default?: any;

    skeleton?: number;
    features?: SupportedListFeatures[];
    format?: SupportedListFormats;
    multiplier?: number; // waa
    style?: string
}

// Middlewares
interface Middleware {
    name(): string;
    run(to?: any, from?: any): Promise<void | boolean | { // RouteLocation, but I cba to figure out how to allow that type here
        name: string;
        replace?: boolean;
    }>;

    postRun?(): Promise<void>; // Confirmation that redirect happened for any clean up actions
}

type PrioritizationMiddleware = Middleware[] | [Middleware, number][];

// API
type APIResponse = ListResponse | ModelResponse;

interface ModelResponse {
    object: string;
    attributes: Record<string, any> & {
        relationships?: Record<string, APIResponse>
    };
    meta: Record<string, any> & {
        extra_objects?: ModelResponse[]
    };
}

interface PaginationResponse {
    total: number;
    count: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
    links?: {[key: string]: string};
}

interface ListResponse {
    object: 'list';
    data: ModelResponse[];
    meta: ListResponseMeta;
}

type ListResponseMeta = Record<string, any> & {
    pagination: PaginationResponse,
}

declare module 'vue3-popper' {
    import Vue from 'vue';

    const Popper: Vue.Component;

    export default Popper;
}
