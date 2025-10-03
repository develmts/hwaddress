// src/oui/OUIProvider.ts
// Facade used by HwAddress. Default inner provider = FileProvider.
// Allows user injection via setProvider().
import { FlatFileProvider } from "./FlatFileProvider.js";
class OUIProviderFacade {
    constructor() {
        this.inner = new FlatFileProvider(); // default local-only provider
    }
    setProvider(p) {
        this.inner = p;
    }
    async resolveFromCanonical(fullCanonical) {
        const addr = {
            canonical: fullCanonical,
        };
        return this.inner.resolveFromAddress(addr);
    }
    async resolveByPrefix(prefix24Canonical) {
        return this.inner.resolveByPrefix(prefix24Canonical);
    }
}
// Singleton facade
export const OUIProvider = new OUIProviderFacade();
