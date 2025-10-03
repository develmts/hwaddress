import type { AbstractOuiProvider } from "./AbstractOUIProvider.js";
declare class OUIProviderFacade {
    private inner;
    constructor();
    setProvider(p: AbstractOuiProvider): void;
    resolveFromCanonical(fullCanonical: string): Promise<string | undefined>;
    resolveByPrefix(prefix24Canonical: string): Promise<string | undefined>;
}
export declare const OUIProvider: OUIProviderFacade;
export {};
