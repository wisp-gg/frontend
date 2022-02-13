import { convertDataToCamelCase } from '~/helpers';

export class BaseModel {
    [key: string]: any;
    private relationships: Record<string, any> = {};

    // We'd use a constructor, but due to how inheritance works we'd initialize the values,
    // then set the default values (as super() call is always first in constructor).
    initialize(data: Record<string, any>, relationships: Record<string, any>): this {
        this.relationships = relationships;

        const props = Object.keys(data);
        for(const prop of props) {
            const descriptor = Object.getOwnPropertyDescriptor(data, prop);
            if (!descriptor) continue;

            Object.defineProperty(this, prop, descriptor);
        }

        return this;
    }

    update(data: Record<string, any>): this {
        if ('prepend_relationships' in data) {
            for(const relationship in data.prepend_relationships) {
                const relationshipData = data.prepend_relationships[relationship];
                if (Array.isArray(relationshipData)) {
                    this.prependToRelationship(relationship, ...relationshipData);
                } else {
                    this.prependToRelationship(relationship, relationshipData);
                }
            }

            delete data['prepend_relationships'];
        }

        if ('update_relationships' in data) {
            for(const relationship in data.update_relationships) {
                this.updateRelationship(relationship, data.update_relationships[relationship]);
            }

            delete data['update_relationships'];
        }

        // As we send all data with underscores to the API, we'll need to normalize these again, or we'll have
        // duplicate keys with different syntax.
        data = convertDataToCamelCase(data);

        for(const key in data) {
            // Unfortunately, I don't remember why initialize() needed Object.defineProperty, so let's hope this doesn't
            // cause the same issues because otherwise Object.defineProperty breaks reactivity with Vue.
            this[key] = data[key];
        }

        return this;
    }

    protected getRelationship(name: string): any {
        if (this.relationships && this.relationships[name]) {
            return this.relationships[name];
        }

        return null;
    }

    updateRelationship(name: string, data: any) {
        this.relationships[name] = data;
    }

    prependToRelationship(name: string, ...data: any[]) {
        if (!Array.isArray(this.relationships[name])) {
            throw new Error('Unable to append to a non-array relationship.');
        }

        this.relationships[name].unshift(...data);
    }

    getAttributes() {
        const attributes: Record<string, any> = {};

        for(const key in this) {
            if (key === 'relationships') continue;

            attributes[key] = this[key];
        }

        return attributes;
    }

    getRouteName() {
        throw new Error(`This model (${this.constructor.name}) does not have route name configured.`);
    }

    getRouteID(layout: string): string {
        throw new Error(`This model (${this.constructor.name}) does not have route ID configured.`);
    }
}
