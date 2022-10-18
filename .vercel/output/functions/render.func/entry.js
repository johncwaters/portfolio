import * as adapter from '@astrojs/vercel/serverless/entrypoint';
import { escape } from 'html-escaper';
import etag from 'etag';
import { lookup } from 'mrmime';
import sharp$1 from 'sharp';
import fs from 'node:fs/promises';
/* empty css                                */import './chunks/08-2022-Creating-My-Portfolio.5fd18360.b021670a.mjs';
import { dim, bold, red, yellow, cyan, green, bgGreen, black } from 'kleur/colors';
import path, { extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs$1 from 'node:fs';
import glob from 'tiny-glob';
import slash from 'slash';
import sizeOf from 'image-size';
/* empty css                                                         */import 'mime';
import 'cookie';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

function check$1(Component) {
	return Component['render'] && Component['$$render'];
}

async function renderToStaticMarkup$1(Component, props, slotted) {
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		slots[key] = () =>
			`<astro-slot${key === 'default' ? '' : ` name="${key}"`}>${value}</astro-slot>`;
	}
	const { html } = Component.render(props, { $$slots: slots });
	return { html };
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.5.0";

function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLString extends String {
  get [Symbol.toStringTag]() {
    return "HTMLString";
  }
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};
function isHTMLString(value) {
  return Object.prototype.toString.call(value) === "[object HTMLString]";
}

function removeLeadingForwardSlashWindows(path) {
  return path.startsWith("/") && path[2] === ":" ? path.substring(1) : path;
}

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.filePath = removeLeadingForwardSlashWindows(filePathname);
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const url = new URL(specifier, this.mockURL);
      return removeLeadingForwardSlashWindows(decodeURI(url.pathname));
    } else {
      return specifier;
    }
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
  Uint8Array: 8,
  Uint16Array: 9,
  Uint32Array: 10
};
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [
        PROP_TYPE.Map,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object Set]": {
      return [
        PROP_TYPE.Set,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value, metadata, parents))];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, JSON.stringify(Array.from(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      if (value) {
        extracted.props[key.slice(0, -5)] = serializeListValue(value);
      }
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = escapeHTML(value);
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(decodeURI(renderer.clientEntrypoint));
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

class SlotString extends HTMLString {
  constructor(content, instructions) {
    super(content);
    this.instructions = instructions;
  }
}
async function renderSlot(_result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    let instructions = null;
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        if (instructions === null) {
          instructions = [];
        }
        instructions.push(chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(new SlotString(content, instructions));
  }
  return fallback;
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  let children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) {
              slotInstructions = [];
            }
            slotInstructions.push(...output.instructions);
          }
          children[key] = output;
        })
      )
    );
  }
  return { slotInstructions, children };
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof SlotString) {
    if (child.instructions) {
      yield* child.instructions;
    }
    yield child;
  } else if (isHTMLString(child)) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (ArrayBuffer.isView(child)) {
    yield child;
  } else if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    yield* child;
  } else {
    yield child;
  }
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(JSON.parse(t)),9:t=>new Uint16Array(JSON.parse(t)),10:t=>new Uint32Array(JSON.parse(t))},o=(t,s)=>{if(t===""||!Array.isArray(s))return s;const[e,n]=s;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const s=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const r of n){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove())}for(const r of s){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("name")||"default"]=r.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((s,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate);let s=this.getAttribute("before-hydration-url");s&&await import(s),this.start()}start(){const s=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:r}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),i=this.getAttribute("component-export")||"default";if(!i.includes("."))this.Component=a[i];else{this.Component=a;for(const d of i.split("."))this.Component=this.Component[d]}return this.hydrator=r,this.hydrate},s,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}
class HTMLParts {
  constructor() {
    this.parts = "";
  }
  append(part, result) {
    if (ArrayBuffer.isView(part)) {
      this.parts += decoder.decode(part);
    } else {
      this.parts += stringifyChunk(result, part);
    }
  }
  toString() {
    return this.parts;
  }
  toArrayBuffer() {
    return encoder.encode(this.parts);
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = {"PUBLIC_VERCEL_ANALYTICS_KEY":"VBLJWoOy3WUinZ6WedmUQhTc2w9","BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : !!obj.isAstroComponentFactory;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let parts = new HTMLParts();
  for await (const chunk of renderAstroComponent(Component)) {
    parts.append(chunk, result);
  }
  return parts.toString();
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary$1 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary$1 = dictionary$1.length;
function bitwise$1(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash$1(text) {
  let num;
  let result = "";
  let integer = bitwise$1(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary$1) {
    num = integer % binary$1;
    integer = Math.floor(integer / binary$1);
    result = dictionary$1[num] + result;
  }
  if (integer > 0) {
    result = dictionary$1[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `const ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value), shouldEscape);
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue (jsx)"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (isAstroComponentFactory(Component)) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const { slotInstructions: slotInstructions2, children: children2 } = await renderSlots(result, slots);
      const html2 = Component.render({ slots: children2 });
      const hydrationHtml = slotInstructions2 ? slotInstructions2.map((instr) => stringifyChunk(result, instr)).join("") : "";
      return markHTMLString(hydrationHtml + html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    return async function* () {
      if (slotInstructions) {
        yield* slotInstructions;
      }
      if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
        yield html;
      } else {
        yield markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
      }
    }();
  }
  const astroId = shorthash$1(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    if (slotInstructions) {
      yield* slotInstructions;
    }
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
function renderHead(result) {
  result._metadata.hasRenderedHead = true;
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (result._metadata.hasRenderedHead) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [Renderer]: "astro:jsx",
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result._metadata.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let parts = new HTMLParts();
        for await (const chunk of output) {
          parts.append(chunk, result);
        }
        return markHTMLString(parts.toString());
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
  originalConsoleError(msg, ...rest);
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

function isOutputFormat(value) {
  return ["avif", "jpeg", "png", "webp"].includes(value);
}
function isAspectRatioString(value) {
  return /^\d*:\d*$/.test(value);
}
function isRemoteImage(src) {
  return /^http(s?):\/\//.test(src);
}
async function loadLocalImage(src) {
  try {
    return await fs.readFile(src);
  } catch {
    return void 0;
  }
}
async function loadRemoteImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return void 0;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return void 0;
  }
}
function parseAspectRatio(aspectRatio) {
  if (!aspectRatio) {
    return void 0;
  }
  if (typeof aspectRatio === "number") {
    return aspectRatio;
  } else {
    const [width, height] = aspectRatio.split(":");
    return parseInt(width) / parseInt(height);
  }
}

class SharpService {
  async getImageAttributes(transform) {
    const { width, height, src, format, quality, aspectRatio, ...rest } = transform;
    return {
      ...rest,
      width,
      height
    };
  }
  serializeTransform(transform) {
    const searchParams = new URLSearchParams();
    if (transform.quality) {
      searchParams.append("q", transform.quality.toString());
    }
    if (transform.format) {
      searchParams.append("f", transform.format);
    }
    if (transform.width) {
      searchParams.append("w", transform.width.toString());
    }
    if (transform.height) {
      searchParams.append("h", transform.height.toString());
    }
    if (transform.aspectRatio) {
      searchParams.append("ar", transform.aspectRatio.toString());
    }
    searchParams.append("href", transform.src);
    return { searchParams };
  }
  parseTransform(searchParams) {
    if (!searchParams.has("href")) {
      return void 0;
    }
    let transform = { src: searchParams.get("href") };
    if (searchParams.has("q")) {
      transform.quality = parseInt(searchParams.get("q"));
    }
    if (searchParams.has("f")) {
      const format = searchParams.get("f");
      if (isOutputFormat(format)) {
        transform.format = format;
      }
    }
    if (searchParams.has("w")) {
      transform.width = parseInt(searchParams.get("w"));
    }
    if (searchParams.has("h")) {
      transform.height = parseInt(searchParams.get("h"));
    }
    if (searchParams.has("ar")) {
      const ratio = searchParams.get("ar");
      if (isAspectRatioString(ratio)) {
        transform.aspectRatio = ratio;
      } else {
        transform.aspectRatio = parseFloat(ratio);
      }
    }
    return transform;
  }
  async transform(inputBuffer, transform) {
    const sharpImage = sharp$1(inputBuffer, { failOnError: false, pages: -1 });
    sharpImage.rotate();
    if (transform.width || transform.height) {
      const width = transform.width && Math.round(transform.width);
      const height = transform.height && Math.round(transform.height);
      sharpImage.resize(width, height);
    }
    if (transform.format) {
      sharpImage.toFormat(transform.format, { quality: transform.quality });
    }
    const { data, info } = await sharpImage.toBuffer({ resolveWithObject: true });
    return {
      data,
      format: info.format
    };
  }
}
const service = new SharpService();
var sharp_default = service;

const sharp = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: sharp_default
}, Symbol.toStringTag, { value: 'Module' }));

const get = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const transform = sharp_default.parseTransform(url.searchParams);
    if (!transform) {
      return new Response("Bad Request", { status: 400 });
    }
    let inputBuffer = void 0;
    if (isRemoteImage(transform.src)) {
      inputBuffer = await loadRemoteImage(transform.src);
    } else {
      const clientRoot = new URL("../client/", import.meta.url);
      const localPath = new URL("." + transform.src, clientRoot);
      inputBuffer = await loadLocalImage(localPath);
    }
    if (!inputBuffer) {
      return new Response(`"${transform.src} not found`, { status: 404 });
    }
    const { data, format } = await sharp_default.transform(inputBuffer, transform);
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": lookup(format) || "",
        "Cache-Control": "public, max-age=31536000",
        ETag: etag(inputBuffer),
        Date: new Date().toUTCString()
      }
    });
  } catch (err) {
    return new Response(`Server Error: ${err}`, { status: 500 });
  }
};

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	get
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/D:/Projects/portfolio/src/components/BaseHead.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$d = createAstro("/D:/Projects/portfolio/src/components/BaseHead.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const { title, description, image = "/placeholder-social.jpg" } = Astro2.props;
  return renderTemplate`<!-- Global Metadata --><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" type="image/svg+xml" href="/astro.svg">
<meta name="generator"${addAttribute(Astro2.generator, "content")}>

<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title"${addAttribute(title, "content")}>
<meta name="description"${addAttribute(description, "content")}>

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url"${addAttribute(Astro2.url, "content")}>
<meta property="og:title"${addAttribute(title, "content")}>
<meta property="og:description"${addAttribute(description, "content")}>
<meta property="og:image"${addAttribute(new URL(image, Astro2.url), "content")}>

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url"${addAttribute(Astro2.url, "content")}>
<meta property="twitter:title"${addAttribute(title, "content")}>
<meta property="twitter:description"${addAttribute(description, "content")}>
<meta property="twitter:image"${addAttribute(new URL(image, Astro2.url), "content")}>
`;
});

const $$file$a = "D:/Projects/portfolio/src/components/BaseHead.astro";
const $$url$a = undefined;

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$a,
	default: $$BaseHead,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const SITE_TITLE = "John C. Waters";
const SITE_DESCRIPTION = "Welcome to my website!";

const $$module4$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	SITE_TITLE,
	SITE_DESCRIPTION
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/D:/Projects/portfolio/src/components/VersionSwitcher.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `
  const history = {
    index: ["2022-9", "2022-10"],
    blog: ["2022-9", "2022-10"],
    portfolio: ["2022-9", "2022-10"],
  };
  //get current page path (/portfolio)
  var currentPage = window.location.pathname;
  //return formatted date (2022-9)
  var currentDate = new Date()
    .toLocaleDateString("en-us", {
      year: "numeric",
      month: "numeric",
    })
    .replace(///g, "-")
    .split("-")
    .reverse()
    .join("-");

  console.log(currentPage);
  console.log(currentDate);

  function changePage() {
    //get current page, go direction
    console.log("Hello!");
  }

  var buttons = document.querySelector("#styleSwitcherButtons");

  console.log(buttons);

  buttons!.addEventListener("click", changePage);
` }] });
const $$Astro$c = createAstro("/D:/Projects/portfolio/src/components/VersionSwitcher.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$VersionSwitcher = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$VersionSwitcher;
  return renderTemplate`${maybeRenderHead($$result)}<div id="styleSwitcherButtons" class="btn-group self-center">
  <button id="older" class="btn btn-md">&#60;Older</button>
  <button id="newer" class="btn btn-md">Newer&#62;</button>
</div>

${maybeRenderHead($$result)}`;
});

const $$file$9 = "D:/Projects/portfolio/src/components/VersionSwitcher.astro";
const $$url$9 = undefined;

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$9,
	default: $$VersionSwitcher,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/D:/Projects/portfolio/src/components/Header.astro", { modules: [{ module: $$module4$1, specifier: "../config", assert: {} }, { module: $$module2$1, specifier: "./VersionSwitcher.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/D:/Projects/portfolio/src/components/Header.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Header;
  return renderTemplate`${maybeRenderHead($$result)}<div class="navbar bg-base-100 shadow-lg">
  <div class="navbar-start">
    <div class="dropdown">
      <label tabindex="0" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path>
        </svg>
      </label>
      <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
        <li><a href="/">Home</a></li>
        <li><a href="/portfolio">Portfolio</a></li>
        <li><a href="/blog">Blog</a></li>
        <!-- 
				<div class="btn-group self-center">
					<a class="btn btn-sm md:btn-md lg:btn-lg">&#60;Older</a>
					<a class="btn btn-sm md:btn-md lg:btn-lg">Newer&#62;</a>
				</div>-->
      </ul>
    </div>
    <a href="/" class="btn btn-ghost normal-case text-xl">${SITE_TITLE}</a>
  </div>
  <div class="navbar-end pr-3 hidden lg:flex">
    <ul class="menu menu-horizontal p-0 px-2">
      <li><a href="/">Home</a></li>
      <li><a href="/portfolio">Portfolio</a></li>
      <li><a href="/blog">Blog</a></li>
    </ul>
    <!--<VersionSwitcher /> -->
  </div>
</div>`;
});

const $$file$8 = "D:/Projects/portfolio/src/components/Header.astro";
const $$url$8 = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$8,
	default: $$Header,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/D:/Projects/portfolio/src/components/Footer.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/D:/Projects/portfolio/src/components/Footer.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Footer;
  const today = new Date();
  return renderTemplate`${maybeRenderHead($$result)}<footer class="footer items-center p-4 bg-neutral text-neutral-content myFooter">
	<div class="items-center grid-flow-col">
		<svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" class="fill-current">
			<path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z">
			</path>
		</svg>
		<p>
			&copy; ${today.getFullYear()} John C. Waters - All rights reserved.
		</p>
	</div>
	<div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end pr-4">
		<a href="https://twitter.com/OtzoLive" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current">
				<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z">
				</path>
			</svg>
		</a>
		<a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current">
				<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z">
				</path>
			</svg>
		</a>
		<a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current">
				<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z">
				</path>
			</svg>
		</a>
	</div>
</footer>`;
});

const $$file$7 = "D:/Projects/portfolio/src/components/Footer.astro";
const $$url$7 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$7,
	default: $$Footer,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/D:/Projects/portfolio/src/components/VitalsComp.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [{ type: "inline", value: `
    import { webVitals } from "../pages/vitals";

    //let analyticsId = (Object.assign({"PUBLIC_VERCEL_ANALYTICS_KEY":"VBLJWoOy3WUinZ6WedmUQhTc2w9","BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{PUBLIC:process.env.PUBLIC,})).PUBLIC_VERCEL_ANALYTICS_KEY;

    webVitals({
        path: window.location.origin,
        params: window.location.pathname,
        //analyticsId,
    });
` }] });
const $$Astro$9 = createAstro("/D:/Projects/portfolio/src/components/VitalsComp.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$VitalsComp = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$VitalsComp;
  return renderTemplate`<!-- Include on any page we want Vercel Vitals -->${maybeRenderHead($$result)}
`;
});

const $$file$6 = "D:/Projects/portfolio/src/components/VitalsComp.astro";
const $$url$6 = undefined;

const $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$6,
	default: $$VitalsComp,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/D:/Projects/portfolio/src/layouts/DefaultPage.astro", { modules: [{ module: $$module1$2, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module4$1, specifier: "../config", assert: {} }, { module: $$module5, specifier: "../components/VitalsComp.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/D:/Projects/portfolio/src/layouts/DefaultPage.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$DefaultPage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$DefaultPage;
  return renderTemplate`<html data-theme="wireframe" lang="en-us">
    ${renderComponent($$result, "VitalsComp", $$VitalsComp, {})}

    ${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}
    <!--<GoogleAnalytics id="G-QP2FLYGVL3" />-->

    ${maybeRenderHead($$result)}<body class="flex flex-col min-h-screen">
        ${renderComponent($$result, "Header", $$Header, { "title": SITE_TITLE })}
        <main class="flex-auto">
            ${renderSlot($$result, $$slots["default"])}<!-- Body Stuff goes here -->
        </main>
        ${renderComponent($$result, "Footer", $$Footer, {})}
    </body></html>`;
});

const $$file$5 = "D:/Projects/portfolio/src/layouts/DefaultPage.astro";
const $$url$5 = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$DefaultPage,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/D:/Projects/portfolio/src/pages/index.astro", { modules: [{ module: $$module1$1, specifier: "../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/D:/Projects/portfolio/src/pages/index.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Index$2 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Index$2;
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="hero min-h-screen bg-[url('/background.svg')]">
    <div class="hero-overlay bg-opacity-0"></div>
    <div class="hero-content text-center text-primary">
      <div class="max-w-md">
        <h1 class="mb-5 text-4xl font-bold">Hello there!</h1>
        <p class="mb-5">
          If you couldn't tell, my site is under construction. More updates are
          coming!
        </p>
        <p>Updated 10/17/2022</p>
      </div>
    </div>
  </div><div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row">
      <img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
      <div>
        <h1 class="text-4xl font-bold">Portfolio stuffs are here!</h1>
        <p class="py-6">
          As I build more projects I will be adding them here to showoff. Duh.
        </p>
        <button onclick="location.href='/portfolio';" class="btn btn-primary">My Portfolio</button>
      </div>
    </div>
  </div><div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
      <div>
        <h1 class="text-4xl font-bold">Check out my blog!</h1>
        <p class="py-6">
          I'm no writer, but I can string some words together pretty well sorta
          kinda. Blog posts monthly.
        </p>
        <button onclick="location.href='/blog';" class="btn btn-primary">My Blog</button>
      </div>
    </div>
  </div><div class="hero min-h-screen" style="background-image: url(https://placeimg.com/1000/800/arch);">
    <div class="hero-overlay bg-opacity-60"></div>
    <div class="hero-content text-center text-neutral-content">
      <div class="max-w-md">
        <h1 class="mb-5 text-4xl font-bold">
          What else could possibly be here!?
        </h1>
        <p class="mb-5">
          Honestly, I don't know. Eventually I will find a use for this.
        </p>
        <button onclick="alert('Easter Egg Unlocked: You clicked a button.');" class="btn btn-primary">My... uh... button!</button>
      </div>
    </div>
  </div>` })}`;
});

const $$file$4 = "D:/Projects/portfolio/src/pages/index.astro";
const $$url$4 = "";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$Index$2,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/D:/Projects/portfolio/src/pages/portfolio.astro", { modules: [{ module: $$module1$1, specifier: "../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/D:/Projects/portfolio/src/pages/portfolio.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Portfolio = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Portfolio;
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="hero bg-base-200">
        <div class="hero-content flex-col lg:flex-row-reverse">
            <img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
            <div>
                <h1 class="text-5xl font-bold">Portfolio Stuff!</h1>
                <p class="py-6">Nothing here at the moment :(</p>
                <button class="btn btn-primary">Loading... sike!</button>
            </div>
        </div>
    </div><p style="float:right; padding-top:600px;">made you look</p>` })}`;
});

const $$file$3 = "D:/Projects/portfolio/src/pages/portfolio.astro";
const $$url$3 = "/portfolio";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$Portfolio,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/D:/Projects/portfolio/src/pages/versions/2022-10/index.astro", { modules: [{ module: $$module1$1, specifier: "../../../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/D:/Projects/portfolio/src/pages/versions/2022-10/index.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Index$1;
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="hero min-h-screen bg-[url('/background.svg')]">
		<div class="hero-overlay bg-opacity-0"></div>
		<div class="hero-content text-center text-primary">
			<div class="max-w-md">
				<h1 class="mb-5 text-4xl font-bold">2022-9</h1>
				<p class="mb-5">
					If you couldn't tell, my site is under construction. Feel
					free to poke around at what I do have. More updates are
					coming!
				</p>
				<p>Updated 9/1/2022</p>
			</div>
		</div>
	</div><div class="hero min-h-screen bg-base-200">
		<div class="hero-content flex-col lg:flex-row">
			<img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
			<div>
				<h1 class="text-4xl font-bold">Portfolio stuffs are here!</h1>
				<p class="py-6">
					As I build more projects I will be adding them here to
					showoff. Duh.
				</p>
				<button onclick="location.href='/portfolio';" class="btn btn-primary">My Portfolio</button>
			</div>
		</div>
	</div><div class="hero min-h-screen bg-base-200">
		<div class="hero-content flex-col lg:flex-row-reverse">
			<img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
			<div>
				<h1 class="text-4xl font-bold">Check out my blog!</h1>
				<p class="py-6">
					I'm no writer, but I can string some words together pretty
					well. Blog posts monthly.
				</p>
				<button onclick="location.href='/blog';" class="btn btn-primary">My Blog</button>
			</div>
		</div>
	</div><div class="hero min-h-screen" style="background-image: url(https://placeimg.com/1000/800/arch);">
		<div class="hero-overlay bg-opacity-60"></div>
		<div class="hero-content text-center text-neutral-content">
			<div class="max-w-md">
				<h1 class="mb-5 text-4xl font-bold">
					What else could possibly be here!?
				</h1>
				<p class="mb-5">
					Honestly, I don't know. Eventually I will find a use for
					this.
				</p>
				<button onclick="alert('Easter Egg Unlocked: You clicked a button.');" class="btn btn-primary">My... uh... button!</button>
			</div>
		</div>
	</div>` })}`;
});

const $$file$2 = "D:/Projects/portfolio/src/pages/versions/2022-10/index.astro";
const $$url$2 = "/versions/2022-10";

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$Index$1,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/D:/Projects/portfolio/src/pages/versions/2022-8/index.astro", { modules: [{ module: $$module1$1, specifier: "../../../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/D:/Projects/portfolio/src/pages/versions/2022-8/index.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="hero min-h-screen bg-[url('/background.svg')]">
		<div class="hero-overlay bg-opacity-0"></div>
		<div class="hero-content text-center text-primary">
			<div class="max-w-md">
				<h1 class="mb-5 text-4xl font-bold">2022-8</h1>
				<p class="mb-5">
					If you couldn't tell, my site is under construction. Feel
					free to poke around at what I do have. More updates are
					coming!
				</p>
				<p>Updated 9/1/2022</p>
			</div>
		</div>
	</div><div class="hero min-h-screen bg-base-200">
		<div class="hero-content flex-col lg:flex-row">
			<img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
			<div>
				<h1 class="text-4xl font-bold">Portfolio stuffs are here!</h1>
				<p class="py-6">
					As I build more projects I will be adding them here to
					showoff. Duh.
				</p>
				<button onclick="location.href='/portfolio';" class="btn btn-primary">My Portfolio</button>
			</div>
		</div>
	</div><div class="hero min-h-screen bg-base-200">
		<div class="hero-content flex-col lg:flex-row-reverse">
			<img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
			<div>
				<h1 class="text-4xl font-bold">Check out my blog!</h1>
				<p class="py-6">
					I'm no writer, but I can string some words together pretty
					well. Blog posts monthly.
				</p>
				<button onclick="location.href='/blog';" class="btn btn-primary">My Blog</button>
			</div>
		</div>
	</div><div class="hero min-h-screen" style="background-image: url(https://placeimg.com/1000/800/arch);">
		<div class="hero-overlay bg-opacity-60"></div>
		<div class="hero-content text-center text-neutral-content">
			<div class="max-w-md">
				<h1 class="mb-5 text-4xl font-bold">
					What else could possibly be here!?
				</h1>
				<p class="mb-5">
					Honestly, I don't know. Eventually I will find a use for
					this.
				</p>
				<button onclick="alert('Easter Egg Unlocked: You clicked a button.');" class="btn btn-primary">My... uh... button!</button>
			</div>
		</div>
	</div>` })}`;
});

const $$file$1 = "D:/Projects/portfolio/src/pages/versions/2022-8/index.astro";
const $$url$1 = "/versions/2022-8";

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Index,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const generateUniqueID = () => {
  return `v2-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`;
};

const initMetric = (name, value) => {
  return {
    name,
    value: typeof value === "undefined" ? -1 : value,
    delta: 0,
    entries: [],
    id: generateUniqueID()
  };
};

const observe = (type, callback) => {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(type)) {
      if (type === "first-input" && !("PerformanceEventTiming" in self)) {
        return;
      }
      const po = new PerformanceObserver((l) => l.getEntries().map(callback));
      po.observe({ type, buffered: true });
      return po;
    }
  } catch (e) {
  }
  return;
};

const onHidden = (cb, once) => {
  const onHiddenOrPageHide = (event) => {
    if (event.type === "pagehide" || document.visibilityState === "hidden") {
      cb(event);
      if (once) {
        removeEventListener("visibilitychange", onHiddenOrPageHide, true);
        removeEventListener("pagehide", onHiddenOrPageHide, true);
      }
    }
  };
  addEventListener("visibilitychange", onHiddenOrPageHide, true);
  addEventListener("pagehide", onHiddenOrPageHide, true);
};

const onBFCacheRestore = (cb) => {
  addEventListener("pageshow", (event) => {
    if (event.persisted) {
      cb(event);
    }
  }, true);
};

const bindReporter = (callback, metric, reportAllChanges) => {
  let prevValue;
  return (forceReport) => {
    if (metric.value >= 0) {
      if (forceReport || reportAllChanges) {
        metric.delta = metric.value - (prevValue || 0);
        if (metric.delta || prevValue === void 0) {
          prevValue = metric.value;
          callback(metric);
        }
      }
    }
  };
};

let firstHiddenTime = -1;
const initHiddenTime = () => {
  return document.visibilityState === "hidden" ? 0 : Infinity;
};
const trackChanges = () => {
  onHidden(({ timeStamp }) => {
    firstHiddenTime = timeStamp;
  }, true);
};
const getVisibilityWatcher = () => {
  if (firstHiddenTime < 0) {
    if (window.__WEB_VITALS_POLYFILL__) {
      firstHiddenTime = window.webVitals.firstHiddenTime;
      if (firstHiddenTime === Infinity) {
        trackChanges();
      }
    } else {
      firstHiddenTime = initHiddenTime();
      trackChanges();
    }
    onBFCacheRestore(() => {
      setTimeout(() => {
        firstHiddenTime = initHiddenTime();
        trackChanges();
      }, 0);
    });
  }
  return {
    get firstHiddenTime() {
      return firstHiddenTime;
    }
  };
};

const getFCP = (onReport, reportAllChanges) => {
  const visibilityWatcher = getVisibilityWatcher();
  let metric = initMetric("FCP");
  let report;
  const entryHandler = (entry) => {
    if (entry.name === "first-contentful-paint") {
      if (po) {
        po.disconnect();
      }
      if (entry.startTime < visibilityWatcher.firstHiddenTime) {
        metric.value = entry.startTime;
        metric.entries.push(entry);
        report(true);
      }
    }
  };
  const fcpEntry = window.performance && performance.getEntriesByName && performance.getEntriesByName("first-contentful-paint")[0];
  const po = fcpEntry ? null : observe("paint", entryHandler);
  if (fcpEntry || po) {
    report = bindReporter(onReport, metric, reportAllChanges);
    if (fcpEntry) {
      entryHandler(fcpEntry);
    }
    onBFCacheRestore((event) => {
      metric = initMetric("FCP");
      report = bindReporter(onReport, metric, reportAllChanges);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          metric.value = performance.now() - event.timeStamp;
          report(true);
        });
      });
    });
  }
};

let isMonitoringFCP = false;
let fcpValue = -1;
const getCLS = (onReport, reportAllChanges) => {
  if (!isMonitoringFCP) {
    getFCP((metric2) => {
      fcpValue = metric2.value;
    });
    isMonitoringFCP = true;
  }
  const onReportWrapped = (arg) => {
    if (fcpValue > -1) {
      onReport(arg);
    }
  };
  let metric = initMetric("CLS", 0);
  let report;
  let sessionValue = 0;
  let sessionEntries = [];
  const entryHandler = (entry) => {
    if (!entry.hadRecentInput) {
      const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
      if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1e3 && entry.startTime - firstSessionEntry.startTime < 5e3) {
        sessionValue += entry.value;
        sessionEntries.push(entry);
      } else {
        sessionValue = entry.value;
        sessionEntries = [entry];
      }
      if (sessionValue > metric.value) {
        metric.value = sessionValue;
        metric.entries = sessionEntries;
        report();
      }
    }
  };
  const po = observe("layout-shift", entryHandler);
  if (po) {
    report = bindReporter(onReportWrapped, metric, reportAllChanges);
    onHidden(() => {
      po.takeRecords().map(entryHandler);
      report(true);
    });
    onBFCacheRestore(() => {
      sessionValue = 0;
      fcpValue = -1;
      metric = initMetric("CLS", 0);
      report = bindReporter(onReportWrapped, metric, reportAllChanges);
    });
  }
};

let firstInputEvent;
let firstInputDelay;
let firstInputTimeStamp;
let callbacks;
const listenerOpts = { passive: true, capture: true };
const startTimeStamp = new Date();
const firstInputPolyfill = (onFirstInput) => {
  callbacks.push(onFirstInput);
  reportFirstInputDelayIfRecordedAndValid();
};
const resetFirstInputPolyfill = () => {
  callbacks = [];
  firstInputDelay = -1;
  firstInputEvent = null;
  eachEventType(addEventListener);
};
const recordFirstInputDelay = (delay, event) => {
  if (!firstInputEvent) {
    firstInputEvent = event;
    firstInputDelay = delay;
    firstInputTimeStamp = new Date();
    eachEventType(removeEventListener);
    reportFirstInputDelayIfRecordedAndValid();
  }
};
const reportFirstInputDelayIfRecordedAndValid = () => {
  if (firstInputDelay >= 0 && firstInputDelay < firstInputTimeStamp - startTimeStamp) {
    const entry = {
      entryType: "first-input",
      name: firstInputEvent.type,
      target: firstInputEvent.target,
      cancelable: firstInputEvent.cancelable,
      startTime: firstInputEvent.timeStamp,
      processingStart: firstInputEvent.timeStamp + firstInputDelay
    };
    callbacks.forEach(function(callback) {
      callback(entry);
    });
    callbacks = [];
  }
};
const onPointerDown = (delay, event) => {
  const onPointerUp = () => {
    recordFirstInputDelay(delay, event);
    removePointerEventListeners();
  };
  const onPointerCancel = () => {
    removePointerEventListeners();
  };
  const removePointerEventListeners = () => {
    removeEventListener("pointerup", onPointerUp, listenerOpts);
    removeEventListener("pointercancel", onPointerCancel, listenerOpts);
  };
  addEventListener("pointerup", onPointerUp, listenerOpts);
  addEventListener("pointercancel", onPointerCancel, listenerOpts);
};
const onInput = (event) => {
  if (event.cancelable) {
    const isEpochTime = event.timeStamp > 1e12;
    const now = isEpochTime ? new Date() : performance.now();
    const delay = now - event.timeStamp;
    if (event.type == "pointerdown") {
      onPointerDown(delay, event);
    } else {
      recordFirstInputDelay(delay, event);
    }
  }
};
const eachEventType = (callback) => {
  const eventTypes = [
    "mousedown",
    "keydown",
    "touchstart",
    "pointerdown"
  ];
  eventTypes.forEach((type) => callback(type, onInput, listenerOpts));
};

const getFID = (onReport, reportAllChanges) => {
  const visibilityWatcher = getVisibilityWatcher();
  let metric = initMetric("FID");
  let report;
  const entryHandler = (entry) => {
    if (entry.startTime < visibilityWatcher.firstHiddenTime) {
      metric.value = entry.processingStart - entry.startTime;
      metric.entries.push(entry);
      report(true);
    }
  };
  const po = observe("first-input", entryHandler);
  report = bindReporter(onReport, metric, reportAllChanges);
  if (po) {
    onHidden(() => {
      po.takeRecords().map(entryHandler);
      po.disconnect();
    }, true);
  }
  if (window.__WEB_VITALS_POLYFILL__) {
    if (!po) {
      window.webVitals.firstInputPolyfill(entryHandler);
    }
    onBFCacheRestore(() => {
      metric = initMetric("FID");
      report = bindReporter(onReport, metric, reportAllChanges);
      window.webVitals.resetFirstInputPolyfill();
      window.webVitals.firstInputPolyfill(entryHandler);
    });
  } else {
    if (po) {
      onBFCacheRestore(() => {
        metric = initMetric("FID");
        report = bindReporter(onReport, metric, reportAllChanges);
        resetFirstInputPolyfill();
        firstInputPolyfill(entryHandler);
      });
    }
  }
};

const reportedMetricIDs = {};
const getLCP = (onReport, reportAllChanges) => {
  const visibilityWatcher = getVisibilityWatcher();
  let metric = initMetric("LCP");
  let report;
  const entryHandler = (entry) => {
    const value = entry.startTime;
    if (value < visibilityWatcher.firstHiddenTime) {
      metric.value = value;
      metric.entries.push(entry);
      report();
    }
  };
  const po = observe("largest-contentful-paint", entryHandler);
  if (po) {
    report = bindReporter(onReport, metric, reportAllChanges);
    const stopListening = () => {
      if (!reportedMetricIDs[metric.id]) {
        po.takeRecords().map(entryHandler);
        po.disconnect();
        reportedMetricIDs[metric.id] = true;
        report(true);
      }
    };
    ["keydown", "click"].forEach((type) => {
      addEventListener(type, stopListening, { once: true, capture: true });
    });
    onHidden(stopListening, true);
    onBFCacheRestore((event) => {
      metric = initMetric("LCP");
      report = bindReporter(onReport, metric, reportAllChanges);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          metric.value = performance.now() - event.timeStamp;
          reportedMetricIDs[metric.id] = true;
          report(true);
        });
      });
    });
  }
};

const afterLoad = (callback) => {
  if (document.readyState === "complete") {
    setTimeout(callback, 0);
  } else {
    addEventListener("load", () => setTimeout(callback, 0));
  }
};
const getNavigationEntryFromPerformanceTiming = () => {
  const timing = performance.timing;
  const navigationEntry = {
    entryType: "navigation",
    startTime: 0
  };
  for (const key in timing) {
    if (key !== "navigationStart" && key !== "toJSON") {
      navigationEntry[key] = Math.max(
        timing[key] - timing.navigationStart,
        0
      );
    }
  }
  return navigationEntry;
};
const getTTFB = (onReport) => {
  const metric = initMetric("TTFB");
  afterLoad(() => {
    try {
      const navigationEntry = performance.getEntriesByType("navigation")[0] || getNavigationEntryFromPerformanceTiming();
      metric.value = metric.delta = navigationEntry.responseStart;
      if (metric.value < 0 || metric.value > performance.now())
        return;
      metric.entries = [navigationEntry];
      onReport(metric);
    } catch (error) {
    }
  });
};

const vitalsUrl = "https://vitals.vercel-analytics.com/v1/vitals";
let vercelKey = Object.assign({"PUBLIC_VERCEL_ANALYTICS_KEY":"VBLJWoOy3WUinZ6WedmUQhTc2w9","BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}, { OS: process.env.OS, PUBLIC: process.env.PUBLIC }).PUBLIC_VERCEL_ANALYTICS_KEY;
if (vercelKey === void 0) {
  console.log("No Vercel Key");
}
let envMode = Object.assign({"PUBLIC_VERCEL_ANALYTICS_KEY":"VBLJWoOy3WUinZ6WedmUQhTc2w9","BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}, { OS: process.env.OS, PUBLIC: process.env.PUBLIC }).MODE;
function getConnectionSpeed() {
  return "connection" in navigator && navigator["connection"] && "effectiveType" in navigator["connection"] ? navigator["connection"]["effectiveType"] : "";
}
function sendToAnalytics(metric, options) {
  const page = Object.entries(options.params).reduce(
    (acc, [key, value]) => acc.replace(value, `[${key}]`),
    options.path
  );
  const body = {
    dsn: vercelKey,
    id: metric.id,
    page,
    href: location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed()
  };
  if (options.debug) {
    console.log("[Analytics]", metric.name, JSON.stringify(body, null, 2));
  }
  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: "application/x-www-form-urlencoded"
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else
    fetch(vitalsUrl, {
      body: blob,
      method: "POST",
      credentials: "omit",
      keepalive: true
    });
}
function webVitals(options) {
  if (envMode === "production") {
    try {
      getFID((metric) => sendToAnalytics(metric, options));
      getTTFB((metric) => sendToAnalytics(metric, options));
      getLCP((metric) => sendToAnalytics(metric, options));
      getCLS((metric) => sendToAnalytics(metric, options));
      getFCP((metric) => sendToAnalytics(metric, options));
    } catch (err) {
      console.error("[Analytics]", err);
    }
  }
}

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	webVitals
}, Symbol.toStringTag, { value: 'Module' }));

const PKG_NAME = "@astrojs/image";
const ROUTE_PATTERN = "/_image";
const OUTPUT_DIR = "/_image";

const PREFIX = "@astrojs/image";
const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function getPrefix(level, timestamp) {
  let prefix = "";
  if (timestamp) {
    prefix += dim(dateTimeFormat.format(new Date()) + " ");
  }
  switch (level) {
    case "debug":
      prefix += bold(green(`[${PREFIX}] `));
      break;
    case "info":
      prefix += bold(cyan(`[${PREFIX}] `));
      break;
    case "warn":
      prefix += bold(yellow(`[${PREFIX}] `));
      break;
    case "error":
      prefix += bold(red(`[${PREFIX}] `));
      break;
  }
  return prefix;
}
const log = (_level, dest) => ({ message, level, prefix = true, timestamp = true }) => {
  if (levels[_level] >= levels[level]) {
    dest(`${prefix ? getPrefix(level, timestamp) : ""}${message}`);
  }
};
const info = log("info", console.info);
const debug = log("debug", console.debug);
const warn = log("warn", console.warn);

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

function removeQueryString(src) {
  const index = src.lastIndexOf("?");
  return index > 0 ? src.substring(0, index) : src;
}
function removeExtname(src) {
  const ext = path.extname(src);
  if (!ext) {
    return src;
  }
  const index = src.lastIndexOf(ext);
  return src.substring(0, index);
}
function ensureDir(dir) {
  fs$1.mkdirSync(dir, { recursive: true });
}
function propsToFilename({ src, width, height, format }) {
  let filename = removeQueryString(src);
  const ext = path.extname(filename);
  filename = removeExtname(filename);
  if (isRemoteImage(src)) {
    filename += `-${shorthash(src)}`;
  }
  if (width && height) {
    return `${filename}_${width}x${height}.${format}`;
  } else if (width) {
    return `${filename}_${width}w.${format}`;
  } else if (height) {
    return `${filename}_${height}h.${format}`;
  }
  return format ? src.replace(ext, format) : src;
}
function filenameFormat(transform) {
  return isRemoteImage(transform.src) ? path.join(OUTPUT_DIR, path.basename(propsToFilename(transform))) : path.join(OUTPUT_DIR, path.dirname(transform.src), path.basename(propsToFilename(transform)));
}

function getTimeStat(timeStart, timeEnd) {
  const buildTime = timeEnd - timeStart;
  return buildTime < 750 ? `${Math.round(buildTime)}ms` : `${(buildTime / 1e3).toFixed(2)}s`;
}
async function ssgBuild({ loader, staticImages, srcDir, outDir, logLevel }) {
  const timer = performance.now();
  info({
    level: logLevel,
    prefix: false,
    message: `${bgGreen(
      black(` optimizing ${staticImages.size} image${staticImages.size > 1 ? "s" : ""} `)
    )}`
  });
  const inputFiles = /* @__PURE__ */ new Set();
  for (const [src, transformsMap] of staticImages) {
    let inputFile = void 0;
    let inputBuffer = void 0;
    if (isRemoteImage(src)) {
      inputBuffer = await loadRemoteImage(src);
    } else {
      const inputFileURL = new URL(`.${src}`, srcDir);
      inputFile = fileURLToPath(inputFileURL);
      inputBuffer = await loadLocalImage(inputFile);
      inputFiles.add(inputFile);
    }
    if (!inputBuffer) {
      warn({ level: logLevel, message: `"${src}" image could not be fetched` });
      continue;
    }
    const transforms = Array.from(transformsMap.entries());
    debug({ level: logLevel, prefix: false, message: `${green("\u25B6")} ${src}` });
    let timeStart = performance.now();
    if (inputFile) {
      const to = inputFile.replace(fileURLToPath(srcDir), fileURLToPath(outDir));
      await ensureDir(path.dirname(to));
      await fs.copyFile(inputFile, to);
      const timeEnd = performance.now();
      const timeChange = getTimeStat(timeStart, timeEnd);
      const timeIncrease = `(+${timeChange})`;
      const pathRelative = inputFile.replace(fileURLToPath(srcDir), "");
      debug({
        level: logLevel,
        prefix: false,
        message: `  ${cyan("\u2514\u2500")} ${dim(`(original) ${pathRelative}`)} ${dim(timeIncrease)}`
      });
    }
    for (const [filename, transform] of transforms) {
      timeStart = performance.now();
      let outputFile;
      if (isRemoteImage(src)) {
        const outputFileURL = new URL(path.join("./", OUTPUT_DIR, path.basename(filename)), outDir);
        outputFile = fileURLToPath(outputFileURL);
      } else {
        const outputFileURL = new URL(path.join("./", OUTPUT_DIR, filename), outDir);
        outputFile = fileURLToPath(outputFileURL);
      }
      const { data } = await loader.transform(inputBuffer, transform);
      ensureDir(path.dirname(outputFile));
      await fs.writeFile(outputFile, data);
      const timeEnd = performance.now();
      const timeChange = getTimeStat(timeStart, timeEnd);
      const timeIncrease = `(+${timeChange})`;
      const pathRelative = outputFile.replace(fileURLToPath(outDir), "");
      debug({
        level: logLevel,
        prefix: false,
        message: `  ${cyan("\u2514\u2500")} ${dim(pathRelative)} ${dim(timeIncrease)}`
      });
    }
  }
  info({
    level: logLevel,
    prefix: false,
    message: dim(`Completed in ${getTimeStat(timer, performance.now())}.
`)
  });
}

async function globImages(dir) {
  fileURLToPath(dir);
  return await glob("./**/*.{heic,heif,avif,jpeg,jpg,png,tiff,webp,gif}", {
    cwd: fileURLToPath(dir)
  });
}
async function ssrBuild({ srcDir, outDir }) {
  const images = await globImages(srcDir);
  for (const image of images) {
    const from = path.join(fileURLToPath(srcDir), image);
    const to = path.join(fileURLToPath(outDir), image);
    await ensureDir(path.dirname(to));
    await fs.copyFile(from, to);
  }
}

async function metadata(src) {
  const file = await fs.readFile(src);
  const { width, height, type, orientation } = await sizeOf(file);
  const isPortrait = (orientation || 0) >= 5;
  if (!width || !height || !type) {
    return void 0;
  }
  return {
    src,
    width: isPortrait ? height : width,
    height: isPortrait ? width : height,
    format: type
  };
}

function createPlugin(config, options) {
  const filter = (id) => /^(?!\/_image?).*.(heic|heif|avif|jpeg|jpg|png|tiff|webp|gif)$/.test(id);
  const virtualModuleId = "virtual:image-loader";
  let resolvedConfig;
  let loaderModuleId;
  async function resolveLoader(context) {
    if (!loaderModuleId) {
      const module = await context.resolve(options.serviceEntryPoint);
      if (!module) {
        throw new Error(`"${options.serviceEntryPoint}" could not be found`);
      }
      loaderModuleId = module.id;
    }
    return loaderModuleId;
  }
  return {
    name: "@astrojs/image",
    enforce: "pre",
    configResolved(viteConfig) {
      resolvedConfig = viteConfig;
    },
    async resolveId(id) {
      if (id === virtualModuleId) {
        return await resolveLoader(this);
      }
    },
    async load(id) {
      if (!filter(id)) {
        return null;
      }
      const meta = await metadata(id);
      const fileUrl = pathToFileURL(id);
      const src = resolvedConfig.isProduction ? fileUrl.pathname.replace(config.srcDir.pathname, "/") : id;
      const output = {
        ...meta,
        src: slash(src)
      };
      return `export default ${JSON.stringify(output)}`;
    }
  };
}

function isHostedService(service) {
  return "getImageSrc" in service;
}
function isSSRService(service) {
  return "transform" in service;
}

function resolveSize(transform) {
  if (transform.width && transform.height) {
    return transform;
  }
  if (!transform.width && !transform.height) {
    throw new Error(`"width" and "height" cannot both be undefined`);
  }
  if (!transform.aspectRatio) {
    throw new Error(
      `"aspectRatio" must be included if only "${transform.width ? "width" : "height"}" is provided`
    );
  }
  let aspectRatio;
  if (typeof transform.aspectRatio === "number") {
    aspectRatio = transform.aspectRatio;
  } else {
    const [width, height] = transform.aspectRatio.split(":");
    aspectRatio = Number.parseInt(width) / Number.parseInt(height);
  }
  if (transform.width) {
    return {
      ...transform,
      width: transform.width,
      height: Math.round(transform.width / aspectRatio)
    };
  } else if (transform.height) {
    return {
      ...transform,
      width: Math.round(transform.height * aspectRatio),
      height: transform.height
    };
  }
  return transform;
}
async function resolveTransform(input) {
  if (typeof input.src === "string") {
    return resolveSize(input);
  }
  const metadata = "then" in input.src ? (await input.src).default : input.src;
  let { width, height, aspectRatio, format = metadata.format, ...rest } = input;
  if (!width && !height) {
    width = metadata.width;
    height = metadata.height;
  } else if (width) {
    let ratio = parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
    height = height || Math.round(width / ratio);
  } else if (height) {
    let ratio = parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
    width = width || Math.round(height * ratio);
  }
  return {
    ...rest,
    src: metadata.src,
    width,
    height,
    aspectRatio,
    format
  };
}
async function getImage(transform) {
  var _a, _b, _c, _d;
  if (!transform.src) {
    throw new Error("[@astrojs/image] `src` is required");
  }
  let loader = (_a = globalThis.astroImage) == null ? void 0 : _a.loader;
  if (!loader) {
    const { default: mod } = await Promise.resolve().then(() => sharp).catch(() => {
      throw new Error(
        "[@astrojs/image] Builtin image loader not found. (Did you remember to add the integration to your Astro config?)"
      );
    });
    loader = mod;
    globalThis.astroImage = globalThis.astroImage || {};
    globalThis.astroImage.loader = loader;
  }
  const resolved = await resolveTransform(transform);
  const attributes = await loader.getImageAttributes(resolved);
  const isDev = (_b = (Object.assign({"PUBLIC_VERCEL_ANALYTICS_KEY":"VBLJWoOy3WUinZ6WedmUQhTc2w9","BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{SSR:true,}))) == null ? void 0 : _b.DEV;
  const isLocalImage = !isRemoteImage(resolved.src);
  const _loader = isDev && isLocalImage ? sharp_default : loader;
  if (!_loader) {
    throw new Error("@astrojs/image: loader not found!");
  }
  if (isSSRService(_loader)) {
    const { searchParams } = _loader.serializeTransform(resolved);
    if ((_c = globalThis.astroImage) == null ? void 0 : _c.addStaticImage) {
      globalThis.astroImage.addStaticImage(resolved);
    }
    const src = ((_d = globalThis.astroImage) == null ? void 0 : _d.filenameFormat) ? globalThis.astroImage.filenameFormat(resolved, searchParams) : `${ROUTE_PATTERN}?${searchParams.toString()}`;
    return {
      ...attributes,
      src: slash(src)
    };
  }
  return attributes;
}

async function resolveAspectRatio({ src, aspectRatio }) {
  if (typeof src === "string") {
    return parseAspectRatio(aspectRatio);
  } else {
    const metadata = "then" in src ? (await src).default : src;
    return parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
  }
}
async function resolveFormats({ src, formats }) {
  const unique = new Set(formats);
  if (typeof src === "string") {
    unique.add(extname(src).replace(".", ""));
  } else {
    const metadata = "then" in src ? (await src).default : src;
    unique.add(extname(metadata.src).replace(".", ""));
  }
  return [...unique];
}
async function getPicture(params) {
  const { src, widths } = params;
  if (!src) {
    throw new Error("[@astrojs/image] `src` is required");
  }
  if (!widths || !Array.isArray(widths)) {
    throw new Error("[@astrojs/image] at least one `width` is required");
  }
  const aspectRatio = await resolveAspectRatio(params);
  if (!aspectRatio) {
    throw new Error("`aspectRatio` must be provided for remote images");
  }
  async function getSource(format) {
    const imgs = await Promise.all(
      widths.map(async (width) => {
        const img = await getImage({
          src,
          format,
          width,
          height: Math.round(width / aspectRatio)
        });
        return `${img.src} ${width}w`;
      })
    );
    return {
      type: lookup(format) || format,
      srcset: imgs.join(",")
    };
  }
  const allFormats = await resolveFormats(params);
  const image = await getImage({
    src,
    width: Math.max(...widths),
    aspectRatio,
    format: allFormats[allFormats.length - 1]
  });
  const sources = await Promise.all(allFormats.map((format) => getSource(format)));
  return {
    sources,
    image
  };
}

function integration(options = {}) {
  const resolvedOptions = {
    serviceEntryPoint: "@astrojs/image/sharp",
    logLevel: "info",
    ...options
  };
  const staticImages = /* @__PURE__ */ new Map();
  let _config;
  let output;
  function getViteConfiguration() {
    return {
      plugins: [createPlugin(_config, resolvedOptions)],
      optimizeDeps: {
        include: ["image-size", "sharp"]
      },
      ssr: {
        noExternal: ["@astrojs/image", resolvedOptions.serviceEntryPoint]
      }
    };
  }
  return {
    name: PKG_NAME,
    hooks: {
      "astro:config:setup": ({ command, config, injectRoute, updateConfig }) => {
        _config = config;
        output = command === "dev" ? "server" : config.output;
        updateConfig({ vite: getViteConfiguration() });
        if (output === "server") {
          injectRoute({
            pattern: ROUTE_PATTERN,
            entryPoint: command === "dev" ? "@astrojs/image/endpoints/dev" : "@astrojs/image/endpoints/prod"
          });
        }
      },
      "astro:server:setup": async ({ server }) => {
        globalThis.astroImage = {};
      },
      "astro:build:setup": () => {
        function addStaticImage(transform) {
          const srcTranforms = staticImages.has(transform.src) ? staticImages.get(transform.src) : /* @__PURE__ */ new Map();
          srcTranforms.set(propsToFilename(transform), transform);
          staticImages.set(transform.src, srcTranforms);
        }
        globalThis.astroImage = output === "static" ? {
          addStaticImage,
          filenameFormat
        } : {};
      },
      "astro:build:done": async ({ dir }) => {
        var _a;
        if (output === "server") {
          await ssrBuild({ srcDir: _config.srcDir, outDir: dir });
        } else {
          const loader = (_a = globalThis == null ? void 0 : globalThis.astroImage) == null ? void 0 : _a.loader;
          if (loader && "transform" in loader && staticImages.size > 0) {
            await ssgBuild({
              loader,
              staticImages,
              srcDir: _config.srcDir,
              outDir: dir,
              logLevel: resolvedOptions.logLevel
            });
          }
        }
      }
    }
  };
}

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: integration,
	getImage,
	getPicture,
	isHostedService,
	isSSRService
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/D:/Projects/portfolio/node_modules/@astrojs/image/components/Image.astro", { modules: [{ module: $$module1, specifier: "../dist/index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/D:/Projects/portfolio/node_modules/@astrojs/image/components/Image.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Image;
  const { loading = "lazy", decoding = "async", ...props } = Astro2.props;
  const attrs = await getImage(props);
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<img${spreadAttributes(attrs, "attrs", { "class": "astro-PWIMEXDQ" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}>

`;
});

createMetadata("/D:/Projects/portfolio/node_modules/@astrojs/image/components/Picture.astro", { modules: [{ module: $$module1, specifier: "../dist/index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/D:/Projects/portfolio/node_modules/@astrojs/image/components/Picture.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Picture = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Picture;
  const {
    src,
    alt,
    sizes,
    widths,
    aspectRatio,
    formats = ["avif", "webp"],
    loading = "lazy",
    decoding = "async",
    ...attrs
  } = Astro2.props;
  const { image, sources } = await getPicture({ src, widths, formats, aspectRatio });
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<picture${spreadAttributes(attrs, "attrs", { "class": "astro-HQAFPWCH" })}>
	${sources.map((attrs2) => renderTemplate`<source${spreadAttributes(attrs2, "attrs", { "class": "astro-HQAFPWCH" })}${addAttribute(sizes, "sizes")}>`)}
	<img${spreadAttributes(image, "image", { "class": "astro-HQAFPWCH" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}${addAttribute(alt, "alt")}>
</picture>

`;
});

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	Image: $$Image,
	Picture: $$Picture
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
createMetadata("/D:/Projects/portfolio/src/layouts/BlogPost.astro", { modules: [{ module: $$module1$2, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module4, specifier: "@astrojs/image/components", assert: {} }, { module: $$module5, specifier: "../components/VitalsComp.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/D:/Projects/portfolio/src/layouts/BlogPost.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const {
    content: {
      title,
      description,
      publishDate,
      updatedDate,
      heroImage,
      readTime,
      tags
    }
  } = Astro2.props;
  var updatedDateCheck = "";
  var lastUpdatedOn = "";
  if (updatedDate === void 0) ; else if (updatedDate != void 0) {
    lastUpdatedOn = "Last updated on ";
    updatedDateCheck = updatedDate;
  }
  const assets = await Astro2.glob(/* #__PURE__ */ Object.assign({"../assets/placeholder-about.jpg": () => import('./chunks/placeholder-about.ed9d509c.mjs'),"../assets/placeholder-hero.jpg": () => import('./chunks/placeholder-hero.5dc9e66a.mjs')}), () => "../assets/**/*");
  const heroImageAsset = assets.find((asset) => {
    if (!heroImage) {
      return false;
    }
    if (!asset.default?.src) {
      return false;
    }
    const index = asset.default.src.indexOf("/assets/");
    return asset.default.src.slice(index) === heroImage;
  });
  return renderTemplate(_a || (_a = __template(['<html data-theme="wireframe" lang="en-us" class="scroll-smooth">\n	', "\n\n	", "\n\n	", '<body class="flex flex-col min-h-screen">\n		', `
		<main class="flex-auto">
			<!--Exit Button -->
			<button class="btn btn-circle btn-outline m-3 md:m-6 lg:m-10" onclick="location.href='/blog'">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<article class="prose prose-lg container px-4 mx-auto pb-4 md:pb-5 lg:pb-7">
				`, '\n\n				<h1 class="text-3xl">', '</h1>\n\n				<div class="container columns-3">\n					<p class="text-primary text-sm m-0">\n						Posted ', '\n					</p>\n					<p class="text-primary text-sm m-0 text-left">\n						Read time: ', '\n					</p>\n					<p class="text-primary text-sm m-0 text-right">\n						', "\n						", '\n					</p>\n				</div>\n				<div class="divider m-0"></div>\n				', '\n				<!-- This is where blog content goes -->\n			</article>\n			<!-- Back to top button -->\n			<button type="button" data-mdb-ripple="true" data-mdb-ripple-color="light" class="p-3 btn transition duration-700 ease-in-out opacity-0 bottom-5 right-5 fixed invisible" id="btn-back-to-top">\n				<svg aria-hidden="true" focusable="false" data-prefix="fas" class="w-4 h-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">\n					<path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z">\n					</path>\n				</svg>\n			</button>\n		</main>\n		', '\n		<!-- Class myFooter -->\n		<script>\n			// Get the backToTop button\n			let mybutton = document.getElementById("btn-back-to-top");\n\n			//Get default values for displaying height\n			var myFooter = document.querySelector(".myFooter");\n			var trueHeight =\n				document.documentElement.scrollHeight -\n				document.documentElement.clientHeight;\n\n			//default values\n			var footerHeight = myFooter.clientHeight;\n			var footerHeightDif = trueHeight - myFooter.clientHeight;\n\n			//Update values on window resize\n			window.onresize = function () {\n				var myFooter = document.querySelector(".myFooter");\n				//TODO excellent blog material to describe why you have to subtract the clientHeight from scrollHeight to get the proper size for this\n				//get true height by subtracting the clients height, then matches with max ScrollTop\n\n				trueHeight =\n					document.documentElement.scrollHeight -\n					document.documentElement.clientHeight;\n\n				footerHeight = myFooter.clientHeight;\n				footerHeightDif = trueHeight - myFooter.clientHeight;\n			};\n\n			// Show, hide, or adjust button positioning on scroll\n			window.onscroll = function () {\n				scrollFunction(footerHeightDif, footerHeight);\n			};\n\n			//Determine what height to set the BackToTop button (so it stays above the footer)\n			function scrollFunction(footerHeightDif, footerHeight) {\n				if (\n					document.documentElement.scrollTop > 40 &&\n					document.documentElement.scrollTop < footerHeightDif\n				) {\n					mybutton.style.bottom = "20px";\n					mybutton.style.opacity = "1";\n					mybutton.style.visibility = "visible";\n				} else if (\n					document.documentElement.scrollTop >= footerHeightDif\n				) {\n					mybutton.style.bottom = footerHeight + 5 + "px";\n					mybutton.style.opacity = "1";\n					mybutton.style.visibility = "visible";\n				} else {\n					mybutton.style.opacity = "0";\n					mybutton.style.visibility = "hidden";\n				}\n			}\n			// When the user clicks on the button, scroll to the top of the document\n			mybutton.addEventListener("click", backToTop);\n\n			function backToTop() {\n				document.body.scrollTop = 0;\n				document.documentElement.scrollTop = 0;\n			}\n		<\/script>\n	</body>\n</html>'])), renderComponent($$result, "VitalsComp", $$VitalsComp, {}), renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description }), maybeRenderHead($$result), renderComponent($$result, "Header", $$Header, {}), heroImageAsset && renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": heroImageAsset.default, "alt": "" })}`, title, publishDate && renderTemplate`<time>${publishDate}</time>`, readTime, lastUpdatedOn, updatedDateCheck && renderTemplate`<time>${updatedDateCheck}</time>`, renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
});

const html$3 = "<p><strong>TLDR:</strong> I used ESRI tools and Astro to build a modular custom Dashboard for viewing utility maps. The main challenges were keeping the tools to just ESRI (for simplicity) and keeping it modular so we could add more quickly. While the methods I describe are probably not ‘the best way’, it’s what I came up with in a short amount of time.</p>\n<h2 id=\"maps-maps-maps\">Maps, maps, maps…</h2>\n<p>I work at ELM Companies, specifically their utility locating branch that specializes in… well utility locating. You call 811 before you dig and they probably call us (if you live on the west coast).</p>\n<p>That’s pretty simple. It gets complicated when you realize that each state has several utilities each with several utility companies responsibile for them.</p>\n<blockquote>\n<p>The number of electric utility companies operating in the United States is estimated at over 3,300, with around 200 of them providing power to the majority of users. The U.S. power grid connects about 2.5 million miles of feeder lines and over 450,000 miles of high-voltage transmission lines.<br>\n— <cite>Statista<sup><a href=\"#user-content-fn-1\" id=\"user-content-fnref-1\" data-footnote-ref=\"\" aria-describedby=\"footnote-label\">1</a></sup></cite></p>\n</blockquote>\n<p>That’s just the electric companies! Gas, water, anything that runs through a pipe has to be carefully tracked and managed to ensure reliability.</p>\n<h2 id=\"okay-but-what-about-maps\">Okay, but what about maps?</h2>\n<p>My most recent project at work gave me an opportunity to build a custom Dashboard displaying utility maps with some filters. I used Astro as a framework, ESRI Javascript SDK for the managing the map, and their Calcite Design System for UI components.</p>\n<p>Loading the map up is made easy with the SDK.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #FF7B72\">const</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">map</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">Map</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">          basemap: </span><span style=\"color: #A5D6FF\">\"arcgis-topographic\"</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #8B949E\">// Basemap layer service</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        });</span></span></code></pre>\n<p>The main challenge was adding unique filters and keeping the whole system modular in order to support future Dashboards without having to rewrite everything. Our goals were:</p>\n<ol>\n<li>Display a map that could be used on desktop or mobile devices</li>\n<li>Use ESRI tools as much as possible, avoiding too much custom HTML and CSS</li>\n<li>Keep it modular so future dashboards can be easily added, even if it’s by someone else</li>\n</ol>\n<h4 id=\"mobile-and-desktop-display\">Mobile and Desktop Display</h4>\n<p>Usually making a website compatible with many screensizes requires a bit of work. Typically I use Tailwind CSS media queries to quick make elements responsive, but that wasn’t an option.</p>\n<p>Luckily I was pretty spoiled in this case and had little to no work to do since the ESRI SDK handled everything for me. Just create the component, stick it on the screen, it handles the rest.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #8B949E\">// Adding a layerList expand widget</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">layerList </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">LayerList</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  container: document.</span><span style=\"color: #D2A8FF\">createElement</span><span style=\"color: #C9D1D9\">(</span><span style=\"color: #A5D6FF\">\"div\"</span><span style=\"color: #C9D1D9\">),</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  view: view</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">});</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">layerListExpand </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">Expand</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  view: view,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  content: layerList</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">});</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">view.ui.</span><span style=\"color: #D2A8FF\">add</span><span style=\"color: #C9D1D9\">(layerListExpand, </span><span style=\"color: #A5D6FF\">\"top-right\"</span><span style=\"color: #C9D1D9\">);</span></span></code></pre>\n<p><img src=\"/blog/ezri-resize-example.gif\" alt=\"A GIF example of a ESRI map resizing and adjusting the UI accordingly\"></p>\n<p>Anytime the screen size changed, the map and widgets simply adjusted themselves. Job done.</p>\n<h4 id=\"using-esri-tools-only\">Using ESRI Tools Only</h4>\n<p>ESRI provides everything needed to display their maps.</p>\n<p>The map is handled by the Javascript SDK. You initialize a new map and add Feature Layers to build it up (which are basically layers of information). One layer could be for water pipes while another is a layer for gas pipe.</p>\n<p>You don’t create the map in the frontend, you just call the respective API and slap it on the map.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #8B949E\">// Call the feature layer and save to an object</span></span>\n<span class=\"line\"><span style=\"color: #FF7B72\">const</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">featureLayer</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">FeatureLayer</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  url:</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #A5D6FF\">`https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis</span></span>\n<span class=\"line\"><span style=\"color: #A5D6FF\">    /rest/services/Landscape_Trees/FeatureServer/0`</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">});</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #8B949E\">// Slap it on the map</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">map.</span><span style=\"color: #D2A8FF\">add</span><span style=\"color: #C9D1D9\">(featureLayer);</span></span></code></pre>\n<p>Now you have some data on top of your map!</p>\n<p><img src=\"/blog/esri-example-photo.jpg\" alt=\"An image of a map with a new layer on it, showing tree density as circles\"></p>\n<p>You can add as many layers as needed, just keeping in mind that each one is an API call, and the bigger the feature layer the longer the load times.</p>\n<h4 id=\"modular-growth\">Modular Growth</h4>\n<p>To make sure it was as easy as possible to create new Dashboards in the future, I used Astro’s components and pages to build each map programatically.</p>\n<p>The ‘autoMap.astro’ component holds all the logic needed to create the map which accepts a variety of properties and builds each thing on the fly. Almost everything done through the JS SDK is with API, so it’s mostly passing in URL’s and settings.</p>\n<p>For example adding layers is as simple as adding Feature Layer URLS hosted ArcGIS Online to an object:</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #FF7B72\">const</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">urlsList</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    My_First_Nap:</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #A5D6FF\">\"https://arcgis.com/arcgis/rest/services/my_first_map/FeatureServer\"</span><span style=\"color: #C9D1D9\">,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    My_Second_Map:</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #A5D6FF\">\"https://arcgis.com/arcgis/rest/services/my_second_map/FeatureServer\"</span><span style=\"color: #C9D1D9\">,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">};</span></span></code></pre>\n<p>Then a function I created would build off those properties to programatically add each layer to the page. For example, loading multiple layers onto the map without hardcoding each one into the page.</p>\n<p><strong>Note:</strong> Feature Layers have multiple layers themselves, so each one needs added.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #8B949E\">//set options for getting feature layer layers</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #FF7B72\">var</span><span style=\"color: #C9D1D9\"> options </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> { query: { f: </span><span style=\"color: #A5D6FF\">\"json\"</span><span style=\"color: #C9D1D9\"> }, responseType: </span><span style=\"color: #A5D6FF\">\"json\"</span><span style=\"color: #C9D1D9\"> };</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #8B949E\">//get layers for each feature layer provided in 'urls' and add to map</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #FF7B72\">async</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">function</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">getUrls</span><span style=\"color: #C9D1D9\">(</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #FFA657\">urls</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> { [</span><span style=\"color: #FFA657\">x</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">string</span><span style=\"color: #C9D1D9\">]</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">string</span><span style=\"color: #C9D1D9\"> },</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #FFA657\">searchSettings</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> { [</span><span style=\"color: #FFA657\">x</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">string</span><span style=\"color: #C9D1D9\">]</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FFA657\">__esri</span><span style=\"color: #C9D1D9\">.</span><span style=\"color: #FFA657\">SearchSource</span><span style=\"color: #C9D1D9\">[] }</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    ) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #FF7B72\">for</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FF7B72\">let</span><span style=\"color: #C9D1D9\"> u </span><span style=\"color: #FF7B72\">in</span><span style=\"color: #C9D1D9\"> urls) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">            </span><span style=\"color: #8B949E\">// Request list of layers from hosted feature layer</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">            </span><span style=\"color: #FF7B72\">await</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">esriRequest</span><span style=\"color: #C9D1D9\">(urls[u] </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #A5D6FF\">\"?token=\"</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> esriToken, options)</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                .</span><span style=\"color: #D2A8FF\">then</span><span style=\"color: #C9D1D9\">(</span><span style=\"color: #FF7B72\">function</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FFA657\">response</span><span style=\"color: #C9D1D9\">) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                    </span><span style=\"color: #FF7B72\">var</span><span style=\"color: #C9D1D9\"> data </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> response.data.layers;</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                    </span><span style=\"color: #FF7B72\">return</span><span style=\"color: #C9D1D9\"> data;</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                })</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                .</span><span style=\"color: #D2A8FF\">then</span><span style=\"color: #C9D1D9\">(</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                    </span><span style=\"color: #FF7B72\">function</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FFA657\">data</span><span style=\"color: #C9D1D9\">) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                        </span><span style=\"color: #FF7B72\">for</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FF7B72\">let</span><span style=\"color: #C9D1D9\"> i </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">0</span><span style=\"color: #C9D1D9\">; i </span><span style=\"color: #FF7B72\">&#x3C;</span><span style=\"color: #C9D1D9\"> data.</span><span style=\"color: #79C0FF\">length</span><span style=\"color: #C9D1D9\">; i</span><span style=\"color: #FF7B72\">++</span><span style=\"color: #C9D1D9\">) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                            </span><span style=\"color: #8B949E\">//creates a layer</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                            </span><span style=\"color: #FF7B72\">var</span><span style=\"color: #C9D1D9\"> layer </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">FeatureLayer</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                                url: urls[u] </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #A5D6FF\">\"/\"</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> data[i].id,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                                id: data[i].name,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                                title: data[i].name,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                            });</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                            </span><span style=\"color: #8B949E\">//push layer to map</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                            map.layers.</span><span style=\"color: #D2A8FF\">push</span><span style=\"color: #C9D1D9\">(layer);</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                        }</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                    }, (</span><span style=\"color: #FFA657\">error</span><span style=\"color: #C9D1D9\">) </span><span style=\"color: #FF7B72\">=></span><span style=\"color: #C9D1D9\"> { </span><span style=\"color: #8B949E\">/*handle errors*/</span><span style=\"color: #C9D1D9\"> }</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">                );</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        };</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    };</span></span></code></pre>\n<p><em><strong>Never hardcode layers into your map.</strong></em> The Feature Layer URL will never change, but the layers inside are based on whatever work is done in the backend (like with ArcGIS Pro) so they can and will change, causing everything to break.</p>\n<h2 id=\"closing\">Closing</h2>\n<p>Creating unique frontend UI is a lot of fun, but it’s also nice to be able to throw something together really quickly using well made components. ESRI made it easy for me to create a quick proof of concept showing this solution would work for our business.</p>\n<p>I hope you learned something!</p>\n<p>John C. Waters</p>\n<section data-footnotes=\"\" class=\"footnotes\"><h2 class=\"sr-only\" id=\"footnote-label\">Footnotes</h2>\n<ol>\n<li id=\"user-content-fn-1\">\n<p>The above quote is excerpted from a report on <a href=\"https://www.statista.com/statistics/237773/the-largest-electric-utilities-in-the-us-based-on-market-value/#:~:text=The%20number%20of%20electric%20utility,of%20high%2Dvoltage%20transmission%20lines.\">statista</a>, September 2022. <a href=\"#user-content-fnref-1\" data-footnote-backref=\"\" class=\"data-footnote-backref\" aria-label=\"Back to content\">↩</a></p>\n</li>\n</ol>\n</section>";

				const frontmatter$3 = {"layout":"../../layouts/BlogPost.astro","title":"Working With Maps (ESRI) - September 2022","description":"Creating digital maps is a lot more complicated than I thought, especially when you factor in how much information it has to hold while still being coherent. While I don't have to worry about creating the map too much, displaying it effectively and quickly is still a challenge.","publishDate":"Sep 1 2022","heroImage":"/assets/placeholder-hero.jpg","updatedDate":null,"readTime":"9 mins","tags":"NEW, ESRI"};
				const file$3 = "D:/Projects/portfolio/src/pages/blog/09-2022-Working-With-Maps-(ESRI).md";
				const url$3 = "/blog/09-2022-Working-With-Maps-(ESRI)";
				function rawContent$3() {
					return "\n**TLDR:** I used ESRI tools and Astro to build a modular custom Dashboard for viewing utility maps. The main challenges were keeping the tools to just ESRI (for simplicity) and keeping it modular so we could add more quickly. While the methods I describe are probably not 'the best way', it's what I came up with in a short amount of time.\n\n## Maps, maps, maps...\n\nI work at ELM Companies, specifically their utility locating branch that specializes in... well utility locating. You call 811 before you dig and they probably call us (if you live on the west coast).\n\nThat's pretty simple. It gets complicated when you realize that each state has several utilities each with several utility companies responsibile for them.\n\n> The number of electric utility companies operating in the United States is estimated at over 3,300, with around 200 of them providing power to the majority of users. The U.S. power grid connects about 2.5 million miles of feeder lines and over 450,000 miles of high-voltage transmission lines.<br>\n> — <cite>Statista[^1]</cite>\n\n[^1]: The above quote is excerpted from a report on [statista](https://www.statista.com/statistics/237773/the-largest-electric-utilities-in-the-us-based-on-market-value/#:~:text=The%20number%20of%20electric%20utility,of%20high%2Dvoltage%20transmission%20lines.), September 2022.\n\nThat's just the electric companies! Gas, water, anything that runs through a pipe has to be carefully tracked and managed to ensure reliability. \n\n## Okay, but what about maps?\n\nMy most recent project at work gave me an opportunity to build a custom Dashboard displaying utility maps with some filters. I used Astro as a framework, ESRI Javascript SDK for the managing the map, and their Calcite Design System for UI components.\n\nLoading the map up is made easy with the SDK.\n\n```js\nconst map = new Map({\n          basemap: \"arcgis-topographic\" // Basemap layer service\n        });\n```\n\nThe main challenge was adding unique filters and keeping the whole system modular in order to support future Dashboards without having to rewrite everything. Our goals were:\n\n1. Display a map that could be used on desktop or mobile devices\n2. Use ESRI tools as much as possible, avoiding too much custom HTML and CSS\n3. Keep it modular so future dashboards can be easily added, even if it's by someone else\n\n\n#### Mobile and Desktop Display\n\nUsually making a website compatible with many screensizes requires a bit of work. Typically I use Tailwind CSS media queries to quick make elements responsive, but that wasn't an option.\n\nLuckily I was pretty spoiled in this case and had little to no work to do since the ESRI SDK handled everything for me. Just create the component, stick it on the screen, it handles the rest.\n\n```js\n// Adding a layerList expand widget\nlayerList = new LayerList({\n  container: document.createElement(\"div\"),\n  view: view\n});\n\nlayerListExpand = new Expand({\n  view: view,\n  content: layerList\n});\n\nview.ui.add(layerListExpand, \"top-right\");\n```\n![A GIF example of a ESRI map resizing and adjusting the UI accordingly](/blog/ezri-resize-example.gif)\n\nAnytime the screen size changed, the map and widgets simply adjusted themselves. Job done.\n\n#### Using ESRI Tools Only\n\nESRI provides everything needed to display their maps.\n\nThe map is handled by the Javascript SDK. You initialize a new map and add Feature Layers to build it up (which are basically layers of information). One layer could be for water pipes while another is a layer for gas pipe.\n\nYou don't create the map in the frontend, you just call the respective API and slap it on the map.\n\n```js\n// Call the feature layer and save to an object\nconst featureLayer = new FeatureLayer({\n  url:\n    `https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis\n    /rest/services/Landscape_Trees/FeatureServer/0`\n});\n\n// Slap it on the map\nmap.add(featureLayer);\n```\n\nNow you have some data on top of your map! \n\n![An image of a map with a new layer on it, showing tree density as circles](/blog/esri-example-photo.jpg)\n\nYou can add as many layers as needed, just keeping in mind that each one is an API call, and the bigger the feature layer the longer the load times.\n\n#### Modular Growth\n\nTo make sure it was as easy as possible to create new Dashboards in the future, I used Astro's components and pages to build each map programatically. \n\nThe 'autoMap.astro' component holds all the logic needed to create the map which accepts a variety of properties and builds each thing on the fly. Almost everything done through the JS SDK is with API, so it's mostly passing in URL's and settings.\n\nFor example adding layers is as simple as adding Feature Layer URLS hosted ArcGIS Online to an object:\n```js\nconst urlsList = {\n    My_First_Nap:\n        \"https://arcgis.com/arcgis/rest/services/my_first_map/FeatureServer\",\n    My_Second_Map:\n        \"https://arcgis.com/arcgis/rest/services/my_second_map/FeatureServer\",\n};\n```\n\nThen a function I created would build off those properties to programatically add each layer to the page. For example, loading multiple layers onto the map without hardcoding each one into the page.\n\n**Note:** Feature Layers have multiple layers themselves, so each one needs added.\n\n```js\n    //set options for getting feature layer layers\n    var options = { query: { f: \"json\" }, responseType: \"json\" };\n\n    //get layers for each feature layer provided in 'urls' and add to map\n    async function getUrls(\n        urls: { [x: string]: string },\n        searchSettings: { [x: string]: __esri.SearchSource[] }\n    ) {\n        for (let u in urls) {\n            // Request list of layers from hosted feature layer\n            await esriRequest(urls[u] + \"?token=\" + esriToken, options)\n                .then(function (response) {\n                    var data = response.data.layers;\n                    return data;\n                })\n                .then(\n                    function (data) {\n                        for (let i = 0; i < data.length; i++) {\n                            //creates a layer\n                            var layer = new FeatureLayer({\n                                url: urls[u] + \"/\" + data[i].id,\n                                id: data[i].name,\n                                title: data[i].name,\n                            });\n                            //push layer to map\n                            map.layers.push(layer);\n                        }\n                    }, (error) => { /*handle errors*/ }\n                );\n        };\n    };\n```\n\n***Never hardcode layers into your map.*** The Feature Layer URL will never change, but the layers inside are based on whatever work is done in the backend (like with ArcGIS Pro) so they can and will change, causing everything to break.\n\n## Closing\n\nCreating unique frontend UI is a lot of fun, but it's also nice to be able to throw something together really quickly using well made components. ESRI made it easy for me to create a quick proof of concept showing this solution would work for our business. \n\nI hope you learned something!\n\nJohn C. Waters\n";
				}
				function compiledContent$3() {
					return html$3;
				}
				function getHeadings$3() {
					return [{"depth":2,"slug":"maps-maps-maps","text":"Maps, maps, maps…"},{"depth":2,"slug":"okay-but-what-about-maps","text":"Okay, but what about maps?"},{"depth":4,"slug":"mobile-and-desktop-display","text":"Mobile and Desktop Display"},{"depth":4,"slug":"using-esri-tools-only","text":"Using ESRI Tools Only"},{"depth":4,"slug":"modular-growth","text":"Modular Growth"},{"depth":2,"slug":"closing","text":"Closing"},{"depth":2,"slug":"footnote-label","text":"Footnotes"}];
				}
				function getHeaders$3() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$3();
				}				async function Content$3() {
					const { layout, ...content } = frontmatter$3;
					content.file = file$3;
					content.url = url$3;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$3 });
					return createVNode($$BlogPost, {
									file: file$3,
									url: url$3,
									content,
									frontmatter: content,
									headings: getHeadings$3(),
									rawContent: rawContent$3,
									compiledContent: compiledContent$3,
									'server:root': true,
									children: contentFragment
								});
				}
				Content$3[Symbol.for('astro.needsHeadRendering')] = false;

const _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$3,
	file: file$3,
	url: url$3,
	rawContent: rawContent$3,
	compiledContent: compiledContent$3,
	getHeadings: getHeadings$3,
	getHeaders: getHeaders$3,
	Content: Content$3,
	default: Content$3
}, Symbol.toStringTag, { value: 'Module' }));

const html$2 = "<p><strong>TLDR:</strong> I finally started creating my own portfolio website to showcase all my projects. It’s built with Astro, Tailwind, and hosted on Vercel. Today I focused on creating a design doc, building a basic layout with placeholders, and figuring out how to make my site unique.</p>\n<h2 id=\"the-start-of-a-never-ending-process\">The start of a never ending process…</h2>\n<p>Hi! I’m John.</p>\n<p>Currently I work as a Data Analyst but I’m working towards becoming a Front End Developer with a focus on UX Design.</p>\n<p>My goal by making my own portfolio website is not to just showcase my projects, but to document my thought and design process behind each one. This is how I work normally so it just makes sense to include it. My portfolio is the start of a very long process as I plan to update it monthly with my works.</p>\n<p>My main goals are to make sure I:</p>\n<ul>\n<li>Create something unique that isn’t just copy pasted UI components from the internet</li>\n<li>Stand out as a frontend developer (is this even possible?)</li>\n<li>Work on it regularly and keep it updated</li>\n<li>Focus on mobile first design</li>\n<li>Include documentation on how the site was created</li>\n</ul>\n<h2 id=\"standing-out\">Standing out</h2>\n<p>I love design. Specifically the user experience. Everytime I use a new product I am immediately thinking about why it is the way it is. Could it be easier to use? This seems like a poor choice this for design, why did they decide to do it this way?</p>\n<p>To try and showcase that, I decided my portfolio should include my design docs, thought processes, and iterations of the websites design. My guess is no one would read or look through 20 photos of the same website looking different each time.</p>\n<p>That’s when I thought:</p>\n<blockquote>\n<p>Why not just build this into the website in an interactive way?</p>\n</blockquote>\n<p>Or put another way, include buttons that allow the user to quickly swap between design iterations of the website itself. Each time they click the button, the whole website transforms back into an older (or newer) version of itself.</p>\n<p>That way I can show how the website has come together over time in a fun and interesting way, without subjecting visitors to a boring slideshow of UI components.</p>\n<p>Before that can even happen, I need to actually create a first version, so I figured out what I wanted to include:</p>\n<h4 id=\"website-layout\">Website Layout</h4>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<table><thead><tr><th>Web Page</th><th>Description</th></tr></thead><tbody><tr><td>Home</td><td>Where the user lands, first impressions count!</td></tr><tr><td>Blog</td><td>Central place for all my blog posts</td></tr><tr><td>Portfolio</td><td>List of all my projects to explore</td></tr><tr><td>About Me</td><td>List my contacts and a bit about myself</td></tr></tbody></table>\n<p>Then I determined what I wanted to use to build it:</p>\n<h4 id=\"tech-stack\">Tech Stack</h4>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<table><thead><tr><th>Tech</th><th>For</th><th>Why</th></tr></thead><tbody><tr><td>Astro</td><td>Web Framework</td><td>Easy SSR and great for content</td></tr><tr><td>Tailwind</td><td>CSS</td><td>Cause normal css is a pain</td></tr><tr><td>Vercel</td><td>Hosting</td><td>Free and asy push from GitHub</td></tr><tr><td>Typescript</td><td>Language</td><td>Because I need to learn it</td></tr></tbody></table>\n<p>And finally I could start building a site with some placeholders! My first go-around has a ton of placeholders so I could build something quick and dirty. The next challenge is figuring out how my unique website transformations will work before I get too far ahead. I don’t want to have to rebuild everything just because it doesn’t work.</p>\n<h2 id=\"closing\">Closing</h2>\n<p>I hope this first blog post provided some insite into what I hope to accomplish and how I went about planning for it. I plan on posting monthly updates that include future updates, design documents, screenshots, and more.</p>\n<p>Take care!</p>\n<p>John C. Waters</p>\n<p><em>Note to self: add buttons here to go back and forth between blogs! :)</em></p>";

				const frontmatter$2 = {"layout":"../../layouts/BlogPost.astro","title":"Creating My Portfolio - August 2022","description":"I finally started creating my own portfolio website to showcase all my projects. It's built with Astro, Svelte, Tailwind, and hosted on Vercel. Today I focused on creating a design doc, building a basic layout with placeholders, and figuring out how to make my site unique.","publishDate":"Aug 14 2022","heroImage":"/assets/placeholder-hero.jpg","updatedDate":"Aug 17 2022","readTime":"5 min","tags":"NEW, UX DESIGN"};
				const file$2 = "D:/Projects/portfolio/src/pages/blog/08-2022-Creating-My-Portfolio.md";
				const url$2 = "/blog/08-2022-Creating-My-Portfolio";
				function rawContent$2() {
					return "\n**TLDR:** I finally started creating my own portfolio website to showcase all my projects. It's built with Astro, Tailwind, and hosted on Vercel. Today I focused on creating a design doc, building a basic layout with placeholders, and figuring out how to make my site unique.\n\n## The start of a never ending process...\n\nHi! I'm John. \n\nCurrently I work as a Data Analyst but I'm working towards becoming a Front End Developer with a focus on UX Design.\n\nMy goal by making my own portfolio website is not to just showcase my projects, but to document my thought and design process behind each one. This is how I work normally so it just makes sense to include it. My portfolio is the start of a very long process as I plan to update it monthly with my works.\n\nMy main goals are to make sure I:\n\n* Create something unique that isn’t just copy pasted UI components from the internet\n* Stand out as a frontend developer (is this even possible?)\n* Work on it regularly and keep it updated\n* Focus on mobile first design\n* Include documentation on how the site was created\n\n## Standing out\n\nI love design. Specifically the user experience. Everytime I use a new product I am immediately thinking about why it is the way it is. Could it be easier to use? This seems like a poor choice this for design, why did they decide to do it this way?\n\nTo try and showcase that, I decided my portfolio should include my design docs, thought processes, and iterations of the websites design. My guess is no one would read or look through 20 photos of the same website looking different each time.\n\nThat's when I thought: \n>Why not just build this into the website in an interactive way?\n\nOr put another way, include buttons that allow the user to quickly swap between design iterations of the website itself. Each time they click the button, the whole website transforms back into an older (or newer) version of itself.\n\nThat way I can show how the website has come together over time in a fun and interesting way, without subjecting visitors to a boring slideshow of UI components.\n\nBefore that can even happen, I need to actually create a first version, so I figured out what I wanted to include:\n\n#### Website Layout\n\n| Web Page   | Description    | \n| --------  | -------- | \n| Home | Where the user lands, first impressions count!| \n| Blog | Central place for all my blog posts |\n| Portfolio | List of all my projects to explore |\n| About Me | List my contacts and a bit about myself |\n\nThen I determined what I wanted to use to build it:\n\n#### Tech Stack\n\n| Tech   | For    | Why   |\n| --------  | -------- | ------ |\n| Astro | Web Framework | Easy SSR and great for content |\n| Tailwind | CSS | Cause normal css is a pain |\n| Vercel | Hosting | Free and asy push from GitHub |\n| Typescript | Language | Because I need to learn it |\n\nAnd finally I could start building a site with some placeholders! My first go-around has a ton of placeholders so I could build something quick and dirty. The next challenge is figuring out how my unique website transformations will work before I get too far ahead. I don't want to have to rebuild everything just because it doesn't work.\n\n## Closing\n\nI hope this first blog post provided some insite into what I hope to accomplish and how I went about planning for it. I plan on posting monthly updates that include future updates, design documents, screenshots, and more.\n\nTake care!\n\nJohn C. Waters\n\n*Note to self: add buttons here to go back and forth between blogs! :)*";
				}
				function compiledContent$2() {
					return html$2;
				}
				function getHeadings$2() {
					return [{"depth":2,"slug":"the-start-of-a-never-ending-process","text":"The start of a never ending process…"},{"depth":2,"slug":"standing-out","text":"Standing out"},{"depth":4,"slug":"website-layout","text":"Website Layout"},{"depth":4,"slug":"tech-stack","text":"Tech Stack"},{"depth":2,"slug":"closing","text":"Closing"}];
				}
				function getHeaders$2() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$2();
				}				async function Content$2() {
					const { layout, ...content } = frontmatter$2;
					content.file = file$2;
					content.url = url$2;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$2 });
					return createVNode($$BlogPost, {
									file: file$2,
									url: url$2,
									content,
									frontmatter: content,
									headings: getHeadings$2(),
									rawContent: rawContent$2,
									compiledContent: compiledContent$2,
									'server:root': true,
									children: contentFragment
								});
				}
				Content$2[Symbol.for('astro.needsHeadRendering')] = false;

const _page7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$2,
	file: file$2,
	url: url$2,
	rawContent: rawContent$2,
	compiledContent: compiledContent$2,
	getHeadings: getHeadings$2,
	getHeaders: getHeaders$2,
	Content: Content$2,
	default: Content$2
}, Symbol.toStringTag, { value: 'Module' }));

const html$1 = "<p>Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.</p>\n<h2 id=\"headings\">Headings</h2>\n<p>The following HTML <code>&#x3C;h1></code>—<code>&#x3C;h6></code> elements represent six levels of section headings. <code>&#x3C;h1></code> is the highest section level while <code>&#x3C;h6></code> is the lowest.</p>\n<h1 id=\"h1\">H1</h1>\n<h2 id=\"h2\">H2</h2>\n<h3 id=\"h3\">H3</h3>\n<h4 id=\"h4\">H4</h4>\n<h5 id=\"h5\">H5</h5>\n<h6 id=\"h6\">H6</h6>\n<h2 id=\"paragraph\">Paragraph</h2>\n<p>Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.</p>\n<p>Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.</p>\n<h2 id=\"images\">Images</h2>\n<p><img src=\"/placeholder-social.jpg\" alt=\"This is a placeholder image description\"></p>\n<h2 id=\"blockquotes\">Blockquotes</h2>\n<p>The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a <code>footer</code> or <code>cite</code> element, and optionally with in-line changes such as annotations and abbreviations.</p>\n<h4 id=\"blockquote-without-attribution\">Blockquote without attribution</h4>\n<blockquote>\n<p>Tiam, ad mint andaepu dandae nostion secatur sequo quae.<br>\n<strong>Note</strong> that you can use <em>Markdown syntax</em> within a blockquote.</p>\n</blockquote>\n<h4 id=\"blockquote-with-attribution\">Blockquote with attribution</h4>\n<blockquote>\n<p>Don’t communicate by sharing memory, share memory by communicating.<br>\n— <cite>Rob Pike<sup><a href=\"#user-content-fn-1\" id=\"user-content-fnref-1\" data-footnote-ref=\"\" aria-describedby=\"footnote-label\">1</a></sup></cite></p>\n</blockquote>\n<h2 id=\"tables\">Tables</h2>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<table><thead><tr><th>Italics</th><th>Bold</th><th>Code</th></tr></thead><tbody><tr><td><em>italics</em></td><td><strong>bold</strong></td><td><code>code</code></td></tr></tbody></table>\n<h2 id=\"code-blocks\">Code Blocks</h2>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;!</span><span style=\"color: #7EE787\">doctype</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">html</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;</span><span style=\"color: #7EE787\">html</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">lang</span><span style=\"color: #C9D1D9\">=</span><span style=\"color: #A5D6FF\">\"en\"</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;</span><span style=\"color: #7EE787\">head</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  &#x3C;</span><span style=\"color: #7EE787\">meta</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">charset</span><span style=\"color: #C9D1D9\">=</span><span style=\"color: #A5D6FF\">\"utf-8\"</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  &#x3C;</span><span style=\"color: #7EE787\">title</span><span style=\"color: #C9D1D9\">>Example HTML5 Document&#x3C;/</span><span style=\"color: #7EE787\">title</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;/</span><span style=\"color: #7EE787\">head</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;</span><span style=\"color: #7EE787\">body</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  &#x3C;</span><span style=\"color: #7EE787\">p</span><span style=\"color: #C9D1D9\">>Test&#x3C;/</span><span style=\"color: #7EE787\">p</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;/</span><span style=\"color: #7EE787\">body</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;/</span><span style=\"color: #7EE787\">html</span><span style=\"color: #C9D1D9\">></span></span></code></pre>\n<h2 id=\"list-types\">List Types</h2>\n<h4 id=\"ordered-list\">Ordered List</h4>\n<ol>\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ol>\n<h4 id=\"unordered-list\">Unordered List</h4>\n<ul>\n<li>List item</li>\n<li>Another item</li>\n<li>And another item</li>\n</ul>\n<h4 id=\"nested-list\">Nested list</h4>\n<ul>\n<li>Fruit\n<ul>\n<li>Apple</li>\n<li>Orange</li>\n<li>Banana</li>\n</ul>\n</li>\n<li>Dairy\n<ul>\n<li>Milk</li>\n<li>Cheese</li>\n</ul>\n</li>\n</ul>\n<h2 id=\"other-elements--abbr-sub-sup-kbd-mark\">Other Elements — abbr, sub, sup, kbd, mark</h2>\n<p><abbr title=\"Graphics Interchange Format\">GIF</abbr> is a bitmap image format.</p>\n<p>H<sub>2</sub>O</p>\n<p>X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup></p>\n<p>Press <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> to end the session.</p>\n<p>Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.</p>\n<section data-footnotes=\"\" class=\"footnotes\"><h2 class=\"sr-only\" id=\"footnote-label\">Footnotes</h2>\n<ol>\n<li id=\"user-content-fn-1\">\n<p>The above quote is excerpted from Rob Pike’s <a href=\"https://www.youtube.com/watch?v=PAAkCSZUG1c\">talk</a> during Gopherfest, November 18, 2015. <a href=\"#user-content-fnref-1\" data-footnote-backref=\"\" class=\"data-footnote-backref\" aria-label=\"Back to content\">↩</a></p>\n</li>\n</ol>\n</section>";

				const frontmatter$1 = {"layout":"../../layouts/BlogPost.astro","title":"Markdown Style Guide","description":"Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.","publishDate":"Jul 01 2022","heroImage":"/assets/placeholder-hero.jpg"};
				const file$1 = "D:/Projects/portfolio/src/pages/blog/markdown-style-guide.md";
				const url$1 = "/blog/markdown-style-guide";
				function rawContent$1() {
					return "\nHere is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.\n\n## Headings\n\nThe following HTML `<h1>`—`<h6>` elements represent six levels of section headings. `<h1>` is the highest section level while `<h6>` is the lowest.\n\n# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n\n## Paragraph\n\nXerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.\n\nItatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.\n\n## Images\n\n![This is a placeholder image description](/placeholder-social.jpg)\n\n## Blockquotes\n\nThe blockquote element represents content that is quoted from another source, optionally with a citation which must be within a `footer` or `cite` element, and optionally with in-line changes such as annotations and abbreviations.\n\n#### Blockquote without attribution\n\n> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  \n> **Note** that you can use *Markdown syntax* within a blockquote.\n\n#### Blockquote with attribution\n\n> Don't communicate by sharing memory, share memory by communicating.<br>\n> — <cite>Rob Pike[^1]</cite>\n\n[^1]: The above quote is excerpted from Rob Pike's [talk](https://www.youtube.com/watch?v=PAAkCSZUG1c) during Gopherfest, November 18, 2015.\n\n## Tables\n\n| Italics   | Bold     | Code   |\n| --------  | -------- | ------ |\n| *italics* | **bold** | `code` |\n\n## Code Blocks\n\n```html\n<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Example HTML5 Document</title>\n</head>\n<body>\n  <p>Test</p>\n</body>\n</html>\n```\n\n## List Types\n\n#### Ordered List\n\n1. First item\n2. Second item\n3. Third item\n\n#### Unordered List\n\n* List item\n* Another item\n* And another item\n\n#### Nested list\n\n* Fruit\n  * Apple\n  * Orange\n  * Banana\n* Dairy\n  * Milk\n  * Cheese\n\n## Other Elements — abbr, sub, sup, kbd, mark\n\n<abbr title=\"Graphics Interchange Format\">GIF</abbr> is a bitmap image format.\n\nH<sub>2</sub>O\n\nX<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>\n\nPress <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> to end the session.\n\nMost <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.\n";
				}
				function compiledContent$1() {
					return html$1;
				}
				function getHeadings$1() {
					return [{"depth":2,"slug":"headings","text":"Headings"},{"depth":1,"slug":"h1","text":"H1"},{"depth":2,"slug":"h2","text":"H2"},{"depth":3,"slug":"h3","text":"H3"},{"depth":4,"slug":"h4","text":"H4"},{"depth":5,"slug":"h5","text":"H5"},{"depth":6,"slug":"h6","text":"H6"},{"depth":2,"slug":"paragraph","text":"Paragraph"},{"depth":2,"slug":"images","text":"Images"},{"depth":2,"slug":"blockquotes","text":"Blockquotes"},{"depth":4,"slug":"blockquote-without-attribution","text":"Blockquote without attribution"},{"depth":4,"slug":"blockquote-with-attribution","text":"Blockquote with attribution"},{"depth":2,"slug":"tables","text":"Tables"},{"depth":2,"slug":"code-blocks","text":"Code Blocks"},{"depth":2,"slug":"list-types","text":"List Types"},{"depth":4,"slug":"ordered-list","text":"Ordered List"},{"depth":4,"slug":"unordered-list","text":"Unordered List"},{"depth":4,"slug":"nested-list","text":"Nested list"},{"depth":2,"slug":"other-elements--abbr-sub-sup-kbd-mark","text":"Other Elements — abbr, sub, sup, kbd, mark"},{"depth":2,"slug":"footnote-label","text":"Footnotes"}];
				}
				function getHeaders$1() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$1();
				}				async function Content$1() {
					const { layout, ...content } = frontmatter$1;
					content.file = file$1;
					content.url = url$1;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html$1 });
					return createVNode($$BlogPost, {
									file: file$1,
									url: url$1,
									content,
									frontmatter: content,
									headings: getHeadings$1(),
									rawContent: rawContent$1,
									compiledContent: compiledContent$1,
									'server:root': true,
									children: contentFragment
								});
				}
				Content$1[Symbol.for('astro.needsHeadRendering')] = false;

const _page8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$1,
	file: file$1,
	url: url$1,
	rawContent: rawContent$1,
	compiledContent: compiledContent$1,
	getHeadings: getHeadings$1,
	getHeaders: getHeaders$1,
	Content: Content$1,
	default: Content$1
}, Symbol.toStringTag, { value: 'Module' }));

const html = "<p><strong>TLDR:</strong> I used ESRI tools and Astro to build a modular custom Dashboard for viewing utility maps. The main challenges were keeping the tools to just ESRI (for simplicity) and keeping it modular so we could add more quickly. While the methods I describe are probably not ‘the best way’, it’s what I came up with in a short amount of time.</p>\n<h2 id=\"maps-maps-maps\">Maps, maps, maps…</h2>\n<p>I work at ELM Companies, specifically their utility locating branch that specializes in… well utility locating. You call 811 before you dig and they probably call us (if you live on the west coast).</p>\n<p>That’s pretty simple. It gets complicated when you realize that each state has several utilities each with several utility companies responsibile for them.</p>\n<blockquote>\n<p>The number of electric utility companies operating in the United States is estimated at over 3,300, with around 200 of them providing power to the majority of users. The U.S. power grid connects about 2.5 million miles of feeder lines and over 450,000 miles of high-voltage transmission lines.<br>\n— <cite>Statista<sup><a href=\"#user-content-fn-1\" id=\"user-content-fnref-1\" data-footnote-ref=\"\" aria-describedby=\"footnote-label\">1</a></sup></cite></p>\n</blockquote>\n<p>That’s just the electric companies! Gas, water, anything that runs through a pipe has to be carefully tracked and managed to ensure reliability.</p>\n<h2 id=\"okay-but-what-about-maps\">Okay, but what about maps?</h2>\n<p>My most recent project at work gave me an opportunity to build a custom Dashboard displaying utility maps with some filters. I used Astro as a framework, ESRI Javascript SDK for the managing the map, and their Calcite Design System for UI components.</p>\n<p>Loading the map up is made easy with the SDK.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #FF7B72\">const</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">map</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">Map</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  basemap: </span><span style=\"color: #A5D6FF\">\"arcgis-topographic\"</span><span style=\"color: #C9D1D9\">, </span><span style=\"color: #8B949E\">// Basemap layer service</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">});</span></span></code></pre>\n<p>The main challenge was adding unique filters and keeping the whole system modular in order to support future Dashboards without having to rewrite everything. Our goals were:</p>\n<ol>\n<li>Display a map that could be used on desktop or mobile devices</li>\n<li>Use ESRI tools as much as possible, avoiding too much custom HTML and CSS</li>\n<li>Keep it modular so future dashboards can be easily added, even if it’s by someone else</li>\n</ol>\n<h4 id=\"mobile-and-desktop-display\">Mobile and Desktop Display</h4>\n<p>Usually making a website compatible with many screensizes requires a bit of work. Typically I use Tailwind CSS media queries to quick make elements responsive, but that wasn’t an option.</p>\n<p>Luckily I was pretty spoiled in this case and had little to no work to do since the ESRI SDK handled everything for me. Just create the component, stick it on the screen, it handles the rest.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #8B949E\">// Adding a layerList expand widget</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">layerList </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">LayerList</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  container: document.</span><span style=\"color: #D2A8FF\">createElement</span><span style=\"color: #C9D1D9\">(</span><span style=\"color: #A5D6FF\">\"div\"</span><span style=\"color: #C9D1D9\">),</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  view: view,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">});</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">layerListExpand </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">Expand</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  view: view,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  content: layerList,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">});</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">view.ui.</span><span style=\"color: #D2A8FF\">add</span><span style=\"color: #C9D1D9\">(layerListExpand, </span><span style=\"color: #A5D6FF\">\"top-right\"</span><span style=\"color: #C9D1D9\">);</span></span></code></pre>\n<p><img src=\"/blog/ezri-resize-example.gif\" alt=\"A GIF example of a ESRI map resizing and adjusting the UI accordingly\"></p>\n<p>Anytime the screen size changed, the map and widgets simply adjusted themselves. Job done.</p>\n<h4 id=\"using-esri-tools-only\">Using ESRI Tools Only</h4>\n<p>ESRI provides everything needed to display their maps.</p>\n<p>The map is handled by the Javascript SDK. You initialize a new map and add Feature Layers to build it up (which are basically layers of information). One layer could be for water pipes while another is a layer for gas pipe.</p>\n<p>You don’t create the map in the frontend, you just call the respective API and slap it on the map.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #8B949E\">// Call the feature layer and save to an object</span></span>\n<span class=\"line\"><span style=\"color: #FF7B72\">const</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">featureLayer</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">FeatureLayer</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  url: </span><span style=\"color: #A5D6FF\">`https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis</span></span>\n<span class=\"line\"><span style=\"color: #A5D6FF\">    /rest/services/Landscape_Trees/FeatureServer/0`</span><span style=\"color: #C9D1D9\">,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">});</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #8B949E\">// Slap it on the map</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">map.</span><span style=\"color: #D2A8FF\">add</span><span style=\"color: #C9D1D9\">(featureLayer);</span></span></code></pre>\n<p>Now you have some data on top of your map!</p>\n<p><img src=\"/blog/esri-example-photo.jpg\" alt=\"An image of a map with a new layer on it, showing tree density as circles\"></p>\n<p>You can add as many layers as needed, just keeping in mind that each one is an API call, and the bigger the feature layer the longer the load times.</p>\n<h4 id=\"modular-growth\">Modular Growth</h4>\n<p>To make sure it was as easy as possible to create new Dashboards in the future, I used Astro’s components and pages to build each map programatically.</p>\n<p>The ‘autoMap.astro’ component holds all the logic needed to create the map which accepts a variety of properties and builds each thing on the fly. Almost everything done through the JS SDK is with API, so it’s mostly passing in URL’s and settings.</p>\n<p>For example adding layers is as simple as adding Feature Layer URLS hosted ArcGIS Online to an object:</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #FF7B72\">const</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">urlsList</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  My_First_Nap:</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #A5D6FF\">\"https://arcgis.com/arcgis/rest/services/my_first_map/FeatureServer\"</span><span style=\"color: #C9D1D9\">,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  My_Second_Map:</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #A5D6FF\">\"https://arcgis.com/arcgis/rest/services/my_second_map/FeatureServer\"</span><span style=\"color: #C9D1D9\">,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">};</span></span></code></pre>\n<p>Then a function I created would build off those properties to programatically add each layer to the page. For example, loading multiple layers onto the map without hardcoding each one into the page.</p>\n<p><strong>Note:</strong> Feature Layers have multiple layers themselves, so each one needs added.</p>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #8B949E\">//set options for getting feature layer layers</span></span>\n<span class=\"line\"><span style=\"color: #FF7B72\">var</span><span style=\"color: #C9D1D9\"> options </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> { query: { f: </span><span style=\"color: #A5D6FF\">\"json\"</span><span style=\"color: #C9D1D9\"> }, responseType: </span><span style=\"color: #A5D6FF\">\"json\"</span><span style=\"color: #C9D1D9\"> };</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color: #8B949E\">//get layers for each feature layer provided in 'urls' and add to map</span></span>\n<span class=\"line\"><span style=\"color: #FF7B72\">async</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">function</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">getUrls</span><span style=\"color: #C9D1D9\">(</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  </span><span style=\"color: #FFA657\">urls</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> { [</span><span style=\"color: #FFA657\">x</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">string</span><span style=\"color: #C9D1D9\">]</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">string</span><span style=\"color: #C9D1D9\"> },</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  </span><span style=\"color: #FFA657\">searchSettings</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> { [</span><span style=\"color: #FFA657\">x</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">string</span><span style=\"color: #C9D1D9\">]</span><span style=\"color: #FF7B72\">:</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FFA657\">__esri</span><span style=\"color: #C9D1D9\">.</span><span style=\"color: #FFA657\">SearchSource</span><span style=\"color: #C9D1D9\">[] }</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  </span><span style=\"color: #FF7B72\">for</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FF7B72\">let</span><span style=\"color: #C9D1D9\"> u </span><span style=\"color: #FF7B72\">in</span><span style=\"color: #C9D1D9\"> urls) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #8B949E\">// Request list of layers from hosted feature layer</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">    </span><span style=\"color: #FF7B72\">await</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">esriRequest</span><span style=\"color: #C9D1D9\">(urls[u] </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #A5D6FF\">\"?token=\"</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> esriToken, options)</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">      .</span><span style=\"color: #D2A8FF\">then</span><span style=\"color: #C9D1D9\">(</span><span style=\"color: #FF7B72\">function</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FFA657\">response</span><span style=\"color: #C9D1D9\">) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #FF7B72\">var</span><span style=\"color: #C9D1D9\"> data </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> response.data.layers;</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #FF7B72\">return</span><span style=\"color: #C9D1D9\"> data;</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">      })</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">      .</span><span style=\"color: #D2A8FF\">then</span><span style=\"color: #C9D1D9\">(</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        </span><span style=\"color: #FF7B72\">function</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FFA657\">data</span><span style=\"color: #C9D1D9\">) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">          </span><span style=\"color: #FF7B72\">for</span><span style=\"color: #C9D1D9\"> (</span><span style=\"color: #FF7B72\">let</span><span style=\"color: #C9D1D9\"> i </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">0</span><span style=\"color: #C9D1D9\">; i </span><span style=\"color: #FF7B72\">&#x3C;</span><span style=\"color: #C9D1D9\"> data.</span><span style=\"color: #79C0FF\">length</span><span style=\"color: #C9D1D9\">; i</span><span style=\"color: #FF7B72\">++</span><span style=\"color: #C9D1D9\">) {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">            </span><span style=\"color: #8B949E\">//creates a layer</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">            </span><span style=\"color: #FF7B72\">var</span><span style=\"color: #C9D1D9\"> layer </span><span style=\"color: #FF7B72\">=</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">new</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #D2A8FF\">FeatureLayer</span><span style=\"color: #C9D1D9\">({</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">              url: urls[u] </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #A5D6FF\">\"/\"</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #FF7B72\">+</span><span style=\"color: #C9D1D9\"> data[i].id,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">              id: data[i].name,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">              title: data[i].name,</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">            });</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">            </span><span style=\"color: #8B949E\">//push layer to map</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">            map.layers.</span><span style=\"color: #D2A8FF\">push</span><span style=\"color: #C9D1D9\">(layer);</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">          }</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        },</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        (</span><span style=\"color: #FFA657\">error</span><span style=\"color: #C9D1D9\">) </span><span style=\"color: #FF7B72\">=></span><span style=\"color: #C9D1D9\"> {</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">          </span><span style=\"color: #8B949E\">/*handle errors*/</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">        }</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">      );</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  }</span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">}</span></span></code></pre>\n<p><strong><em>Never hardcode layers into your map.</em></strong> The Feature Layer URL will never change, but the layers inside are based on whatever work is done in the backend (like with ArcGIS Pro) so they can and will change, causing everything to break.</p>\n<h2 id=\"closing\">Closing</h2>\n<p>Creating unique frontend UI is a lot of fun, but it’s also nice to be able to throw something together really quickly using well made components. ESRI made it easy for me to create a quick proof of concept showing this solution would work for our business.</p>\n<p>I hope you learned something!</p>\n<p>John C. Waters</p>\n<section data-footnotes=\"\" class=\"footnotes\"><h2 class=\"sr-only\" id=\"footnote-label\">Footnotes</h2>\n<ol>\n<li id=\"user-content-fn-1\">\n<p>The above quote is excerpted from a report on <a href=\"https://www.statista.com/statistics/237773/the-largest-electric-utilities-in-the-us-based-on-market-value/#:~:text=The%20number%20of%20electric%20utility,of%20high%2Dvoltage%20transmission%20lines.\">statista</a>, September 2022. <a href=\"#user-content-fnref-1\" data-footnote-backref=\"\" class=\"data-footnote-backref\" aria-label=\"Back to content\">↩</a></p>\n</li>\n</ol>\n</section>";

				const frontmatter = {"layout":"../../layouts/BlogPost.astro","title":"Something - October 2022","description":"Creating digital maps is a lot more complicated than I thought, especially when you factor in how much information it has to hold while still being coherent. While I don't have to worry about creating the map too much, displaying it effectively and quickly is still a challenge.","publishDate":"Oct 17 2022","heroImage":"/assets/placeholder-hero.jpg","updatedDate":null,"readTime":"9 mins","tags":"NEW, ESRI"};
				const file = "D:/Projects/portfolio/src/pages/blog/10-2022-Something.md";
				const url = "/blog/10-2022-Something";
				function rawContent() {
					return "\n**TLDR:** I used ESRI tools and Astro to build a modular custom Dashboard for viewing utility maps. The main challenges were keeping the tools to just ESRI (for simplicity) and keeping it modular so we could add more quickly. While the methods I describe are probably not 'the best way', it's what I came up with in a short amount of time.\n\n## Maps, maps, maps...\n\nI work at ELM Companies, specifically their utility locating branch that specializes in... well utility locating. You call 811 before you dig and they probably call us (if you live on the west coast).\n\nThat's pretty simple. It gets complicated when you realize that each state has several utilities each with several utility companies responsibile for them.\n\n> The number of electric utility companies operating in the United States is estimated at over 3,300, with around 200 of them providing power to the majority of users. The U.S. power grid connects about 2.5 million miles of feeder lines and over 450,000 miles of high-voltage transmission lines.<br>\n> — <cite>Statista[^1]</cite>\n\n[^1]: The above quote is excerpted from a report on [statista](https://www.statista.com/statistics/237773/the-largest-electric-utilities-in-the-us-based-on-market-value/#:~:text=The%20number%20of%20electric%20utility,of%20high%2Dvoltage%20transmission%20lines.), September 2022.\n\nThat's just the electric companies! Gas, water, anything that runs through a pipe has to be carefully tracked and managed to ensure reliability.\n\n## Okay, but what about maps?\n\nMy most recent project at work gave me an opportunity to build a custom Dashboard displaying utility maps with some filters. I used Astro as a framework, ESRI Javascript SDK for the managing the map, and their Calcite Design System for UI components.\n\nLoading the map up is made easy with the SDK.\n\n```js\nconst map = new Map({\n  basemap: \"arcgis-topographic\", // Basemap layer service\n});\n```\n\nThe main challenge was adding unique filters and keeping the whole system modular in order to support future Dashboards without having to rewrite everything. Our goals were:\n\n1. Display a map that could be used on desktop or mobile devices\n2. Use ESRI tools as much as possible, avoiding too much custom HTML and CSS\n3. Keep it modular so future dashboards can be easily added, even if it's by someone else\n\n#### Mobile and Desktop Display\n\nUsually making a website compatible with many screensizes requires a bit of work. Typically I use Tailwind CSS media queries to quick make elements responsive, but that wasn't an option.\n\nLuckily I was pretty spoiled in this case and had little to no work to do since the ESRI SDK handled everything for me. Just create the component, stick it on the screen, it handles the rest.\n\n```js\n// Adding a layerList expand widget\nlayerList = new LayerList({\n  container: document.createElement(\"div\"),\n  view: view,\n});\n\nlayerListExpand = new Expand({\n  view: view,\n  content: layerList,\n});\n\nview.ui.add(layerListExpand, \"top-right\");\n```\n\n![A GIF example of a ESRI map resizing and adjusting the UI accordingly](/blog/ezri-resize-example.gif)\n\nAnytime the screen size changed, the map and widgets simply adjusted themselves. Job done.\n\n#### Using ESRI Tools Only\n\nESRI provides everything needed to display their maps.\n\nThe map is handled by the Javascript SDK. You initialize a new map and add Feature Layers to build it up (which are basically layers of information). One layer could be for water pipes while another is a layer for gas pipe.\n\nYou don't create the map in the frontend, you just call the respective API and slap it on the map.\n\n```js\n// Call the feature layer and save to an object\nconst featureLayer = new FeatureLayer({\n  url: `https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis\n    /rest/services/Landscape_Trees/FeatureServer/0`,\n});\n\n// Slap it on the map\nmap.add(featureLayer);\n```\n\nNow you have some data on top of your map!\n\n![An image of a map with a new layer on it, showing tree density as circles](/blog/esri-example-photo.jpg)\n\nYou can add as many layers as needed, just keeping in mind that each one is an API call, and the bigger the feature layer the longer the load times.\n\n#### Modular Growth\n\nTo make sure it was as easy as possible to create new Dashboards in the future, I used Astro's components and pages to build each map programatically.\n\nThe 'autoMap.astro' component holds all the logic needed to create the map which accepts a variety of properties and builds each thing on the fly. Almost everything done through the JS SDK is with API, so it's mostly passing in URL's and settings.\n\nFor example adding layers is as simple as adding Feature Layer URLS hosted ArcGIS Online to an object:\n\n```js\nconst urlsList = {\n  My_First_Nap:\n    \"https://arcgis.com/arcgis/rest/services/my_first_map/FeatureServer\",\n  My_Second_Map:\n    \"https://arcgis.com/arcgis/rest/services/my_second_map/FeatureServer\",\n};\n```\n\nThen a function I created would build off those properties to programatically add each layer to the page. For example, loading multiple layers onto the map without hardcoding each one into the page.\n\n**Note:** Feature Layers have multiple layers themselves, so each one needs added.\n\n```js\n//set options for getting feature layer layers\nvar options = { query: { f: \"json\" }, responseType: \"json\" };\n\n//get layers for each feature layer provided in 'urls' and add to map\nasync function getUrls(\n  urls: { [x: string]: string },\n  searchSettings: { [x: string]: __esri.SearchSource[] }\n) {\n  for (let u in urls) {\n    // Request list of layers from hosted feature layer\n    await esriRequest(urls[u] + \"?token=\" + esriToken, options)\n      .then(function (response) {\n        var data = response.data.layers;\n        return data;\n      })\n      .then(\n        function (data) {\n          for (let i = 0; i < data.length; i++) {\n            //creates a layer\n            var layer = new FeatureLayer({\n              url: urls[u] + \"/\" + data[i].id,\n              id: data[i].name,\n              title: data[i].name,\n            });\n            //push layer to map\n            map.layers.push(layer);\n          }\n        },\n        (error) => {\n          /*handle errors*/\n        }\n      );\n  }\n}\n```\n\n**_Never hardcode layers into your map._** The Feature Layer URL will never change, but the layers inside are based on whatever work is done in the backend (like with ArcGIS Pro) so they can and will change, causing everything to break.\n\n## Closing\n\nCreating unique frontend UI is a lot of fun, but it's also nice to be able to throw something together really quickly using well made components. ESRI made it easy for me to create a quick proof of concept showing this solution would work for our business.\n\nI hope you learned something!\n\nJohn C. Waters\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":2,"slug":"maps-maps-maps","text":"Maps, maps, maps…"},{"depth":2,"slug":"okay-but-what-about-maps","text":"Okay, but what about maps?"},{"depth":4,"slug":"mobile-and-desktop-display","text":"Mobile and Desktop Display"},{"depth":4,"slug":"using-esri-tools-only","text":"Using ESRI Tools Only"},{"depth":4,"slug":"modular-growth","text":"Modular Growth"},{"depth":2,"slug":"closing","text":"Closing"},{"depth":2,"slug":"footnote-label","text":"Footnotes"}];
				}
				function getHeaders() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings();
				}				async function Content() {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$BlogPost, {
									file,
									url,
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}
				Content[Symbol.for('astro.needsHeadRendering')] = false;

const _page9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter,
	file,
	url,
	rawContent,
	compiledContent,
	getHeadings,
	getHeaders,
	Content,
	default: Content
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/D:/Projects/portfolio/src/pages/blog.astro", { modules: [{ module: $$module1$1, specifier: "../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/D:/Projects/portfolio/src/pages/blog.astro", "https://johncwaters.com/", "file:///D:/Projects/portfolio/");
const $$Blog = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Blog;
  const posts = (await Astro2.glob(/* #__PURE__ */ Object.assign({"./blog/08-2022-Creating-My-Portfolio.md": () => Promise.resolve().then(() => _page7),"./blog/09-2022-Working-With-Maps-(ESRI).md": () => Promise.resolve().then(() => _page6),"./blog/10-2022-Something.md": () => Promise.resolve().then(() => _page9),"./blog/markdown-style-guide.md": () => Promise.resolve().then(() => _page8)}), () => "./blog/*.{md,mdx}")).sort(
    (a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf()
  );
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<container>
		${posts.map((post) => renderTemplate`<a class="card bg-base-100 shadow-xl mx-auto m-6 w-11/12 md:w-96"${addAttribute(post.url, "href")}>
					<figure>
						<img src="https://placeimg.com/400/225/arch" alt="Shoes">
					</figure>
					<div class="card-body">
						<h2 class="card-title">${post.frontmatter.title}</h2>

						<div class="badge badge-secondary">
							<time${addAttribute(post.frontmatter.publishDate, "datetime")}>
								${new Date(
    post.frontmatter.publishDate
  ).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })}
							</time>
						</div>

						<p>
							${post.frontmatter.description.substring(0, 120) + "..."}
						</p>
						<div class="card-actions justify-end">
							<div class="badge badge-outline">
								${post.frontmatter.tags}
							</div>
							<div class="badge badge-outline">Products</div>
						</div>
					</div>
				</a>`)}
	</container>` })}`;
});

const $$file = "D:/Projects/portfolio/src/pages/blog.astro";
const $$url = "/blog";

const _page10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$Blog,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['node_modules/@astrojs/image/dist/endpoints/prod.js', _page0],['src/pages/index.astro', _page1],['src/pages/portfolio.astro', _page2],['src/pages/versions/2022-10/index.astro', _page3],['src/pages/versions/2022-8/index.astro', _page4],['src/pages/vitals.ts', _page5],['src/pages/blog/09-2022-Working-With-Maps-(ESRI).md', _page6],['src/pages/blog/08-2022-Creating-My-Portfolio.md', _page7],['src/pages/blog/markdown-style-guide.md', _page8],['src/pages/blog/10-2022-Something.md', _page9],['src/pages/blog.astro', _page10],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/svelte","clientEntrypoint":"@astrojs/svelte/client.js","serverEntrypoint":"@astrojs/svelte/server.js"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/image/dist/endpoints/prod.js","pathname":"/_image","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/portfolio","type":"page","pattern":"^\\/portfolio\\/?$","segments":[[{"content":"portfolio","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/portfolio.astro","pathname":"/portfolio","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/versions/2022-10","type":"page","pattern":"^\\/versions\\/2022-10\\/?$","segments":[[{"content":"versions","dynamic":false,"spread":false}],[{"content":"2022-10","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/versions/2022-10/index.astro","pathname":"/versions/2022-10","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/versions/2022-8","type":"page","pattern":"^\\/versions\\/2022-8\\/?$","segments":[[{"content":"versions","dynamic":false,"spread":false}],[{"content":"2022-8","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/versions/2022-8/index.astro","pathname":"/versions/2022-8","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"routeData":{"route":"/vitals","type":"endpoint","pattern":"^\\/vitals$","segments":[[{"content":"vitals","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/vitals.ts","pathname":"/vitals","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css","assets/08-2022-Creating-My-Portfolio.58b7ca84.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/blog/09-2022-working-with-maps-(esri)","type":"page","pattern":"^\\/blog\\/09-2022-Working-With-Maps-\\(ESRI\\)\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"09-2022-Working-With-Maps-(ESRI)","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/09-2022-Working-With-Maps-(ESRI).md","pathname":"/blog/09-2022-Working-With-Maps-(ESRI)","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css","assets/08-2022-Creating-My-Portfolio.58b7ca84.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/blog/08-2022-creating-my-portfolio","type":"page","pattern":"^\\/blog\\/08-2022-Creating-My-Portfolio\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"08-2022-Creating-My-Portfolio","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/08-2022-Creating-My-Portfolio.md","pathname":"/blog/08-2022-Creating-My-Portfolio","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css","assets/08-2022-Creating-My-Portfolio.58b7ca84.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/blog/markdown-style-guide","type":"page","pattern":"^\\/blog\\/markdown-style-guide\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"markdown-style-guide","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/markdown-style-guide.md","pathname":"/blog/markdown-style-guide","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css","assets/08-2022-Creating-My-Portfolio.58b7ca84.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/blog/10-2022-something","type":"page","pattern":"^\\/blog\\/10-2022-Something\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"10-2022-Something","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/10-2022-Something.md","pathname":"/blog/10-2022-Something","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog.921f64e6.css","assets/08-2022-Creating-My-Portfolio.58b7ca84.css"],"scripts":[{"type":"external","value":"hoisted.db949a37.js"}],"routeData":{"route":"/blog","type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog.astro","pathname":"/blog","_meta":{"trailingSlash":"ignore"}}}],"site":"https://johncwaters.com/","base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"extendDefaultPlugins":false,"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.js","D:/Projects/portfolio/src/assets/placeholder-about.jpg":"chunks/placeholder-about.ed9d509c.mjs","D:/Projects/portfolio/src/assets/placeholder-hero.jpg":"chunks/placeholder-hero.5dc9e66a.mjs","@astrojs/svelte/client.js":"client.788af3ea.js","/astro/hoisted.js?q=0":"hoisted.db949a37.js","astro:scripts/before-hydration.js":""},"assets":["/assets/08-2022-Creating-My-Portfolio.58b7ca84.css","/assets/blog.921f64e6.css","/astro.svg","/background.svg","/client.788af3ea.js","/hoisted.db949a37.js","/placeholder-social.jpg","/blog/esri-example-photo.jpg","/blog/ezri-resize-example.gif"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = undefined;

const _exports = adapter.createExports(_manifest, _args);
const _default = _exports['default'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { _default as default };
