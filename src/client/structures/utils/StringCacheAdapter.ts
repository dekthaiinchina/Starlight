import { Adapter } from "seyfert";
import { Awaitable } from "seyfert/lib/common";

export interface MemoryAdapterOptions<T> {
    encode(data: unknown): T;
    decode(data: T): unknown;
}

export class StringCacheAdapter implements Adapter {
    isAsync = false;
    private storage = new Map<string, string>();
    private relationships = new Map<string, string[]>();

    constructor(
        public options: MemoryAdapterOptions<string> = {
            encode: JSON.stringify,
            decode: (data: string) => {
                try {
                    return JSON.parse(data) as unknown;
                } catch {
                    return data; // Return as-is if it's not JSON
                }
            },
        },
    ) {}
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    bulkPatch(keyValue: [string, any][]): Awaitable<void> {
        keyValue.forEach(([key, value]) => {
            if (this.storage.has(key)) {
                this.storage.set(key, this.options.encode(value));
            }
        });
    }
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    patch(id: string, data: any): Awaitable<void> {
        if (this.storage.has(id)) {
            this.storage.set(id, this.options.encode(data));
        }
    }

    start() {}
    // eslint-disable-next-line @typescript-eslint/require-await
    async scan(query: string, keys: boolean = false): Promise<string[]> {
        return [...this.storage.entries()]
            .filter(([key]) => key.split('.').every((v, i) => v === query.split('.')[i] || v === '*'))
            .map(([key, value]) => (keys ? key : this.options.decode(value)))
            .filter((val): val is string => typeof val === 'string');
    }

    bulkGet(keys: string[]): unknown[] {
        return keys.map(key => this.options.decode(this.storage.get(key) || '')).filter(Boolean);
    }

    get(key: string): unknown {
        return this.options.decode(this.storage.get(key) || '');
    }

    bulkSet(entries: [string, unknown][]) {
        entries.forEach(([key, value]) => this.storage.set(key, this.options.encode(value)));
    }

    set(key: string, data: unknown) {
        this.storage.set(key, this.options.encode(data));
    }

    bulkUpdate(entries: [string, unknown][]) {
        entries.forEach(([key, value]) => this.updateOnly(key, value));
    }
    private updateOnly(key: string, data: unknown) {
        if (!this.storage.has(key)) return;
        this.storage.set(key, this.options.encode(data));
    }

    update(key: string, data: unknown) {
        this.updateOnly(key, data);
    }

    values(to: string): unknown[] {
        return this.keys(to).map(key => this.get(key)).filter(Boolean);
    }

    keys(to: string): string[] {
        return this.getToRelationship(to).map(id => `${to}.${id}`);
    }

    count(to: string): number {
        return this.getToRelationship(to).length;
    }

    bulkRemove(keys: string[]) {
        keys.forEach(key => this.storage.delete(key));
    }

    remove(key: string) {
        this.storage.delete(key);
    }

    flush(): void {
        this.storage.clear();
        this.relationships.clear();
    }

    contains(to: string, key: string): boolean {
        return this.getToRelationship(to).includes(key);
    }

    public getToRelationship(to: string): string[] {
        return this.relationships.get(to) || [];
    }

    bulkAddToRelationShip(data: Record<string, string[]>): void {
        for (const key in data) {
            this.addToRelationship(key, data[key]);
        }
    }

    addToRelationship(to: string, keys: string | string[]) {
        const existing = this.getToRelationship(to);
        this.relationships.set(to, [...new Set([...existing, ...(Array.isArray(keys) ? keys : [keys])])]);
    }

    removeToRelationship(to: string, keys: string | string[]) {
        const existing = this.getToRelationship(to);
        this.relationships.set(to, existing.filter(key => !(Array.isArray(keys) ? keys : [keys]).includes(key)));
    }

    removeRelationship(to: string | string[]) {
        for (const key of Array.isArray(to) ? to : [to]) {
            this.relationships.delete(key);
        }
    }
}