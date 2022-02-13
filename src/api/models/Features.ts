import { BaseModel } from './BaseModel';

export interface Feature {
    available: boolean;
    requires_plan?: string;
    permissions?: string[];
}

export class Features extends BaseModel {
    [key: string]: any

    get(name: string): Feature | undefined {
        if (this[name]) {
            return this[name];
        }
    }

    isAvailable(name: string) {
        return this.get(name)?.available || false;
    }
}
