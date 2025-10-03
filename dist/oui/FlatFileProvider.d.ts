import { AbstractOuiProvider, PrefixHex } from "./AbstractOUIProvider.js";
export declare class FlatFileProvider extends AbstractOuiProvider {
    private path;
    private map;
    constructor(path?: string);
    private ensureLoaded;
    protected lookupExact(prefix: PrefixHex): Promise<string | undefined>;
}
