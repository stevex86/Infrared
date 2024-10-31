const Infrared: typeof import("./src/ir.bundle").default;
const IRClient: typeof import("./src/ir.client").default;

export type InfraredCtor = typeof Infrared;
export type IRClientCtor = typeof IRClient;

/**
 * The proxy part of the URL.
 */
type Coded = string;

/**
 * The URL encoder.
 * Encoders will have to encode the result using encodeURLComponent.
 */
export type IREncode = (input: Coded) => string;

/**
 * The URL encoder.
 * Decoders will have to decode the input first using decodeURLComponent.
 */
export type IRDecode = (input: Coded) => string;

export type IRInject = {
	/**
	 * The host(s) to inject the HTML on.
	 * This is a regex that's tested against the proxied URL's host.
	 */
	host: RegExp;
	/**
	 * Where to inject the HTML
	 * Possible values: `"head" | "body"`
	 */
	injectTo: "head" | "body";
	/**
	 * The HTML to inject.
	 */
	html: string;
};

/**
 * The Infrared configuration object.
 * This interface defines the configuration options for the Infrared library.
 */
export interface IRConfig {
	/**
	 * The prefix for Infrared to listen on.
	 * This prefix will be used to create the URL for the service worker and the client script.
	 * @example `https://example.org/ir/service/`
	 * @example `/ir/service/`
	 * @defaultValue `/service/`
	 */
	prefix?: string;
	/**
	 * The path to the Infrared client script.
	 * This script will be loaded by the browser and is responsible for communicating with the service worker.
	 * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
	 * @example `/ir/ir.client.js`,
	 * @defaultValue `/ir.client.js` or if bundle is specified and the filename is `ir.bundle.js`, the directory of the bundle + `ir.client.js` will be used automatically
	 */
	client?: string;
	/**
	 * The path to the Infrared service worker script.
	 * This script will be registered as a service worker and is responsible for handling network requests.
	 * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
	 * @example `/ir/ir.sw.js`,
	 * @defaultValue `/ir.sw.js`
	 */
	handler?: string;
	/**
	 * The path to the bundled script that contains both the Infrared client and service worker scripts.
	 * This path is optional and can be used instead of the `client` and `handler` paths to load a single bundled script.
	 * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
	 * @example `/ir/ir.bundle.js`,
	 * @defaultValue `/ir.bundle.js`
	 */
	bundle?: string;
	/**
	 * The path to the Infrared configuration script.
	 * This script should export a configuration object that will be used to configure the client and service worker.
	 * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
	 * @example `/ir/ir.config.js`,
	 * @defaultValue `/ir.config.js`
	 */
	config?: string;
	/**
	 * The path to the Infrared service worker script.
	 * This path is optional and can be used instead of the `handler` path to specify a custom service worker script.
	 * Both relative and absolute paths are accepted. Relative paths are resolved to the current URL
	 * @example `/ir/ir.sw.js`,
	 * @defaultValue `/ir.sw.js`
	 */
	sw?: string;
	/**
	 * The URL encoder.
	 * This function will be used to encode URLs before they are sent to the server.
	 * The encoder should use `encodeURIComponent` to encode the URLs.
	 * @defaultValue `Infrared.codec.xor.encode`
	 */
	encodeUrl?: IREncode;
	/**
	 * The URL decoder.
	 * This function will be used to decode URLs after they are received from the server.
	 * The decoder should use `decodeURIComponent` to decode the URLs.
	 * @defaultValue `Infrared.codec.xor.decode`
	 */
	decodeUrl?: IRDecode;
	/**
	 * HTML inject settings.
	 * This property expects an array of `IRInject`.
	 */
	inject?: IRInject[];
}
