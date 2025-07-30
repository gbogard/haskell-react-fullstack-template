import { isClient } from "./utils.js";

/** A config object that can be used at runtime. It is loaded on the server-side and exposed to the client via the a route on the server. */
export type RuntimeConfig = {
    API_URL: string;
};

/** Returns the current runtime config.
 * 
 * On the server, it will return the config from the environment variables.
 * On the client, it will return the config from the window object, which has been injected by the server.
 */
export const getConfig = (): RuntimeConfig => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (isClient()) return (window as any).appConfig as RuntimeConfig;

    // Update the config below to change the contents of the runtime configuration.
    return {
        API_URL: process.env.API_URL || "http://localhost:3000",
    }
}

/** Injects the config into the HTML.
 * 
 * This is used to inject the config into the HTML on the server, so that it can be accessed by the client.
 */
export const injectConfigToHtml = (html: string) => {
    return html.replace("<!--injected-app-config-->", `<script>window.appConfig = ${JSON.stringify(getConfig())}</script>`);
}
