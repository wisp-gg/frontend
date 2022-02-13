import { Router } from '~/core';
import { BaseModel } from './BaseModel';
import { Allocation } from './Allocation';
import { Egg } from './Egg';
import { Node } from './Node';
import { Features } from './Features';
import { User } from './User';
import { Nest } from './Nest';

export class Server extends BaseModel {
    public uuid = '';
    public uuidShort = '';
    public name = '';
    public description = '';
    public limits = {
        memory: -1,
        swap: -1,
        disk: -1,
        io: -1,
        cpu: -1,
    };
    public featureLimits = {
        databases: -1,
        allocations: -1,
        backupMegabytes: -1,
    };
    public monitor = false;
    public supportOp = false;

    // Admin only props
    public id = -1;
    public externalId?: string;
    public startup = '';
    public image = '';
    public suspended = false;
    public installed = -1;
    public updating = false;
    public moving = false;

    public get egg(): Egg {
        return this.getRelationship('egg');
    }

    public get node(): Node {
        return this.getRelationship('node');
    }

    public get allocations(): Allocation[] {
        return this.getRelationship('allocations') || [];
    }

    public primaryAllocation(): Allocation {
        return this.allocations.find(a => a.primary)!;
    }

    public get features(): Features {
        return this.getRelationship('features');
    }

    public get permissions(): string[] {
        return this.getRelationship('permissions') || [];
    }

    public getRouteName() {
        return 'server';
    }

    public getRouteID(layout: string) {
        return layout === 'admin' ? this.id.toString() : this.uuidShort;
    }

    public openConsolePopup() {
        const { href } = Router.resolve({
            name: 'server.console',
            params: { server: this.uuidShort },
        });

        window.open(href, 'Console', 'width=600,height=400');
    }

    // Admin only
    public get nest(): Nest {
        return this.getRelationship('nest');
    }

    public get user(): User {
        return this.getRelationship('user');
    }
}
