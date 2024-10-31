import HTML from "./rewrite/html.js";
import CSS from "./rewrite/css.js";
import JS from "./rewrite/js.js";
import setCookie from "set-cookie-parser";
import { xor, base64, plain } from "./rewrite/codecs.js";
import {
	validateCookie,
	db,
	getCookies,
	setCookies,
	serialize,
} from "./rewrite/cookie.js";
import {
	attributes,
	isUrl,
	isForbidden,
	isHtml,
	isSrcset,
	isStyle,
	text,
	injectHead,
	createHtmlInject,
	createJsInject,
} from "./rewrite/rewrite.html.js";
//import { call, destructureDeclaration, dynamicImport, getProperty, importDeclaration, setProperty, sourceMethods, wrapEval, wrapIdentifier } from './rewrite.script.js';
import {
	dynamicImport,
	identifier,
	importDeclaration,
	property,
	unwrap,
	wrapEval,
} from "./rewrite/rewrite.script.js";
import { openDB } from "idb";
import { BareClient } from "@mercuryworkshop/bare-mux";
import EventEmitter from "events";

/**
 * @typedef {import('../ir.js').IRConfig} IRConfig
 */

class Infrared {
	/**
	 *
	 * @param {IRConfig} [options]
	 */
	constructor(options = {}) {
		this.prefix = options.prefix || "/service/";
		//this.urlRegex = /^(#|about:|data:|mailto:|javascript:)/;
		this.urlRegex = /^(#|about:|data:|mailto:)/;
		this.rewriteUrl = options.rewriteUrl || this.rewriteUrl;
		this.rewriteImport = options.rewriteImport || this.rewriteImport;
		this.sourceUrl = options.sourceUrl || this.sourceUrl;
		this.encodeUrl = options.encodeUrl || this.encodeUrl;
		this.decodeUrl = options.decodeUrl || this.decodeUrl;
		this.vanilla = "vanilla" in options ? options.vanilla : false;
		this.meta = options.meta || {};
		this.meta.base ||= undefined;
		this.meta.origin ||= "";
		this.bundleScript = options.bundle || "/ir.bundle.js";
		this.handlerScript = options.handler || "/ir.handler.js";
		this.clientScript =
			options.client ||
			(options.bundle &&
				options.bundle.includes("ir.bundle.js") &&
				options.bundle.replace("ir.bundle.js", "ir.client.js")) ||
			"/ir.client.js";
		this.configScript = options.config || "/ir.config.js";
		this.meta.url ||= this.meta.base || "";
		this.codec = Infrared.codec;
		this.html = new HTML(this);
		this.css = new CSS(this);
		this.js = new JS(this);
		this.openDB = this.constructor.openDB;
		this.master = "__ir";
		this.dataPrefix = "__ir$";
		this.attributePrefix = "__ir";
		this.createHtmlInject = createHtmlInject;
		this.createJsInject = createJsInject;
		this.attrs = {
			isUrl,
			isForbidden,
			isHtml,
			isSrcset,
			isStyle,
		};
		if (!this.vanilla) this.implementIRMiddleware();
		this.cookie = {
			validateCookie,
			db: () => {
				return db(this.constructor.openDB);
			},
			getCookies,
			setCookies,
			serialize,
			setCookie,
		};
	}
	/**
	 *
	 * @param {string} str Script being imported
	 * @param {string} src Script that is importing
	 * @param {*} meta
	 */
	rewriteImport(str, src, meta = this.meta) {
		// use importiing script as the base
		return this.rewriteUrl(str, {
			...meta,
			base: src,
		});
	}
	rewriteUrl(str, meta = this.meta) {
		str = new String(str).trim();
		if (!str || this.urlRegex.test(str)) return str;

		if (str.startsWith("javascript:")) {
			return "javascript:" + this.js.rewrite(str.slice("javascript:".length));
		}

		try {
			return (
				meta.origin + this.prefix + this.encodeUrl(new URL(str, meta.base).href)
			);
		} catch (e) {
			return meta.origin + this.prefix + this.encodeUrl(str);
		}
	}
	sourceUrl(str, meta = this.meta) {
		if (!str || this.urlRegex.test(str)) return str;
		try {
			return new URL(
				this.decodeUrl(str.slice(this.prefix.length + meta.origin.length)),
				meta.base
			).href;
		} catch (e) {
			return this.decodeUrl(str.slice(this.prefix.length + meta.origin.length));
		}
	}
	encodeUrl(str) {
		return encodeURIComponent(str);
	}
	decodeUrl(str) {
		return decodeURIComponent(str);
	}
	implementIRMiddleware() {
		// HTML
		attributes(this);
		text(this);
		injectHead(this);
		// JS
		importDeclaration(this);
		dynamicImport(this);
		property(this);
		wrapEval(this);
		identifier(this);
		unwrap(this);
	}
	get rewriteHtml() {
		return this.html.rewrite.bind(this.html);
	}
	get sourceHtml() {
		return this.html.source.bind(this.html);
	}
	get rewriteCSS() {
		return this.css.rewrite.bind(this.css);
	}
	get sourceCSS() {
		return this.css.source.bind(this.css);
	}
	get rewriteJS() {
		return this.js.rewrite.bind(this.js);
	}
	get sourceJS() {
		return this.js.source.bind(this.js);
	}
	static codec = { xor, base64, plain };
	static setCookie = setCookie;
	static openDB = openDB;
	static BareClient = BareClient;
	static EventEmitter = EventEmitter;
}

export default Infrared;
if (typeof self === "object") self.Infrared = Infrared;
