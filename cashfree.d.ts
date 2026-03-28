declare module '@cashfreepayments/cashfree-js' {
  export function load(options: { mode: string | 'sandbox' | 'production' }): Promise<any>;
}
