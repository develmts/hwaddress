// src/oui/OUIProvider.ts
// Facade used by HwAddress. Default inner provider = FileProvider.
// Allows user injection via setProvider().

import type { AbstractOuiProvider, AddressLike } from "./AbstractOUIProvider.js"    //"./AbstractProvider";
import { FlatFileProvider } from "./FlatFileProvider.js"

class OUIProviderFacade {
  private inner: AbstractOuiProvider;

  constructor() {
    this.inner = new FlatFileProvider(); // default local-only provider
  }

  setProvider(p: AbstractOuiProvider) {
    this.inner = p;
  }

  async resolveFromCanonical(fullCanonical: string): Promise<string | undefined> {
    const addr:AddressLike = {
      canonical : fullCanonical, 
    }
    return this.inner.resolveFromAddress(addr);
  }

  async resolveByPrefix(prefix24Canonical: string): Promise<string | undefined> {
    return this.inner.resolveByPrefix(prefix24Canonical);
  }
}

// Singleton facade
export const OUIProvider = new OUIProviderFacade();
