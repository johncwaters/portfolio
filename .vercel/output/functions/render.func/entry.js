import * as adapter from '@astrojs/vercel/serverless/entrypoint';
import { escape } from 'html-escaper';
import etag from 'etag';
import { lookup } from 'mrmime';
import sharp$1 from 'sharp';
import fs from 'node:fs/promises';
/* empty css                           */import './chunks/8969b618.437aa1b3.mjs';
import pkg from 'web-vitals';
import * as $$module6 from 'web-vitals/base.js';
/* empty css                           */import path, { extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs$1 from 'node:fs';
import glob from 'tiny-glob';
import slash from 'slash';
import sizeOf from 'image-size';
import 'mime';
import 'kleur/colors';
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

const ASTRO_VERSION = "1.0.5";
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

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
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
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
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
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
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
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=a=>{const e=async()=>{await(await a())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)};`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()};`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}};`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=a=>{(async()=>await(await a())())()};`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(i,c,n)=>{const r=async()=>{await(await i())()};let s=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){s.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];s.observe(t)}};`;

var astro_island_prebuilt_default = `var a;{const l={0:t=>t,1:t=>JSON.parse(t,n),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,n)),5:t=>new Set(JSON.parse(t,n)),6:t=>BigInt(t),7:t=>new URL(t)},n=(t,r)=>{if(t===""||!Array.isArray(r))return r;const[s,i]=r;return s in l?l[s](i):void 0};customElements.get("astro-island")||customElements.define("astro-island",(a=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement?.closest("astro-island[ssr]"))return;const r=this.querySelectorAll("astro-slot"),s={},i=this.querySelectorAll("template[data-astro-template]");for(const e of i)!e.closest(this.tagName)?.isSameNode(this)||(s[e.getAttribute("data-astro-template")||"default"]=e.innerHTML,e.remove());for(const e of r)!e.closest(this.tagName)?.isSameNode(this)||(s[e.getAttribute("name")||"default"]=e.innerHTML);const o=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),n):{};this.hydrator(this)(this.Component,o,s,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((r,s)=>{s.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url"));const r=JSON.parse(this.getAttribute("opts"));Astro[this.getAttribute("client")](async()=>{const s=this.getAttribute("renderer-url"),[i,{default:o}]=await Promise.all([import(this.getAttribute("component-url")),s?import(s):()=>()=>{}]),e=this.getAttribute("component-export")||"default";if(!e.includes("."))this.Component=i[e];else{this.Component=i;for(const c of e.split("."))this.Component=this.Component[c]}return this.hydrator=o,this.hydrate},r,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},a.observedAttributes=["props"],a))}`;

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

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = {"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}) == null ? void 0 : _a.DEV) && props != null) {
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
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
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

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
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
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
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
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
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
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
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
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
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
      return ["@astrojs/react", "@astrojs/preact"];
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
  if (Component && Component.isAstroComponentFactory) {
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
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
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
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
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
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash$1(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
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
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

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
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
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
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
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

const $$metadata$6 = createMetadata("/@fs/D:/Projects/portfolio/src/components/BaseHead.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/D:/Projects/portfolio/src/components/BaseHead.astro", "", "file:///D:/Projects/portfolio/");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
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

const $$file$6 = "D:/Projects/portfolio/src/components/BaseHead.astro";
const $$url$6 = undefined;

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$6,
	default: $$BaseHead,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const SITE_TITLE = "John C. Waters";
const SITE_DESCRIPTION = "Welcome to my website!";

const $$module4$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	SITE_TITLE,
	SITE_DESCRIPTION
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/@fs/D:/Projects/portfolio/src/components/Header.astro", { modules: [{ module: $$module4$1, specifier: "../config", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/D:/Projects/portfolio/src/components/Header.astro", "", "file:///D:/Projects/portfolio/");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
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
				<div class="btn-group self-center">
					<a class="btn btn-sm md:btn-md lg:btn-lg">&#60;Older</a>
					<a class="btn btn-sm md:btn-md lg:btn-lg">Newer&#62;</a>
				</div>
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
		<div class="btn-group self-center">
			<a class="btn btn-md">&#60;Older</a>
			<a class="btn btn-md">Newer&#62;</a>
		</div>
	</div>
</div>`;
});

const $$file$5 = "D:/Projects/portfolio/src/components/Header.astro";
const $$url$5 = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$Header,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/D:/Projects/portfolio/src/components/Footer.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/D:/Projects/portfolio/src/components/Footer.astro", "", "file:///D:/Projects/portfolio/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Footer;
  const today = new Date();
  return renderTemplate`${maybeRenderHead($$result)}<footer class="footer items-center p-4 bg-neutral text-neutral-content">
	<div class="items-center grid-flow-col">
		<svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" class="fill-current">
			<path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z">
			</path>
		</svg>
		<p>&copy; ${today.getFullYear()} John C. Waters - All rights reserved.</p>
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
			</svg></a>
		<a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current">
				<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z">
				</path>
			</svg></a>
	</div>
</footer>`;
});

const $$file$4 = "D:/Projects/portfolio/src/components/Footer.astro";
const $$url$4 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$Footer,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const { getFID, getTTFB, getLCP, getCLS, getFCP } = pkg;

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
    return 'connection' in navigator &&
        navigator['connection'] &&
        'effectiveType' in navigator['connection']
        ? navigator['connection']['effectiveType']
        : '';
}

function sendToAnalytics(metric, options) {
    const page = Object.entries(options.params).reduce(
        (acc, [key, value]) => acc.replace(value, `[${key}]`),
        options.path,
    );

    const body = {
        dsn: options.analyticsId, // qPgJqYH9LQX5o31Ormk8iWhCxZO
        id: metric.id, // v2-1653884975443-1839479248192
        page, // /blog/[slug]
        href: location.href, // https://my-app.vercel.app/blog/my-test
        event_name: metric.name, // TTFB
        value: metric.value.toString(), // 60.20000000298023
        speed: getConnectionSpeed(), // 4g
    };

    if (options.debug) {
        console.log('[Analytics]', metric.name, JSON.stringify(body, null, 2));
    }

    const blob = new Blob([new URLSearchParams(body).toString()], {
        // This content type is necessary for `sendBeacon`
        type: 'application/x-www-form-urlencoded',
    });
    if (navigator.sendBeacon) {
        navigator.sendBeacon(vitalsUrl, blob);
    } else
        fetch(vitalsUrl, {
            body: blob,
            method: 'POST',
            credentials: 'omit',
            keepalive: true,
        });
}

function webVitals(options) {
    try {
        getFID((metric) => sendToAnalytics(metric, options));
        getTTFB((metric) => sendToAnalytics(metric, options));
        getLCP((metric) => sendToAnalytics(metric, options));
        getCLS((metric) => sendToAnalytics(metric, options));
        getFCP((metric) => sendToAnalytics(metric, options));
    } catch (err) {
        console.error('[Analytics]', err);
    }
}

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	webVitals
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$metadata$3 = createMetadata("/@fs/D:/Projects/portfolio/src/layouts/DefaultPage.astro", { modules: [{ module: $$module1$2, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module4$1, specifier: "../config", assert: {} }, { module: _page4, specifier: "../pages/vitals.js", assert: {} }, { module: $$module6, specifier: "web-vitals/base", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/D:/Projects/portfolio/src/layouts/DefaultPage.astro", "", "file:///D:/Projects/portfolio/");
const $$DefaultPage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$DefaultPage;
  return renderTemplate(_a$1 || (_a$1 = __template$1(['<html data-theme="wireframe" lang="en-us">\n    <head>\n        <script><\/script>\n        ', "\n    ", '</head>\n\n    <body class="flex flex-col min-h-screen">\n        ', '\n        <main class="flex-auto">\n            ', "<!-- Body Stuff goes here -->\n        </main>\n        ", "\n    </body></html>"])), renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION }), renderHead($$result), renderComponent($$result, "Header", $$Header, { "title": SITE_TITLE }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
});

const $$file$3 = "D:/Projects/portfolio/src/layouts/DefaultPage.astro";
const $$url$3 = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$DefaultPage,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/D:/Projects/portfolio/src/pages/index.astro", { modules: [{ module: $$module1$1, specifier: "../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/D:/Projects/portfolio/src/pages/index.astro", "", "file:///D:/Projects/portfolio/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="hero min-h-screen bg-[url('/background.svg')]">
			<div class="hero-overlay bg-opacity-0"></div>
			<div class="hero-content text-center text-primary">
				<div class="max-w-md">
					<h1 class="mb-5 text-4xl font-bold">Welcome</h1>
					<p class="mb-5">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
						exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
				</div>
			</div>
		</div><div class="hero min-h-screen bg-base-200">
			<div class="hero-content flex-col lg:flex-row">
				<img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
				<div>
					<h1 class="text-4xl font-bold">Portfolio Stuffs are here!</h1>
					<p class="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
						exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
					<button class="btn btn-primary">Get Started</button>
				</div>
			</div>
		</div><div class="hero min-h-screen bg-base-200">
			<div class="hero-content flex-col lg:flex-row-reverse">
				<img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
				<div>
					<h1 class="text-4xl font-bold">Check out my blog!</h1>
					<p class="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
						exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
					<button class="btn btn-primary">Get Started</button>
				</div>
			</div>
		</div><div class="hero min-h-screen" style="background-image: url(https://placeimg.com/1000/800/arch);">
			<div class="hero-overlay bg-opacity-60"></div>
			<div class="hero-content text-center text-neutral-content">
				<div class="max-w-md">
					<h1 class="mb-5 text-4xl font-bold">What else could possiblely be here!?</h1>
					<p class="mb-5">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
						exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
					<button class="btn btn-primary">Get Started</button>
				</div>
			</div>
		</div>` })}`;
});

const $$file$2 = "D:/Projects/portfolio/src/pages/index.astro";
const $$url$2 = "";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$Index,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/D:/Projects/portfolio/src/pages/portfolio.astro", { modules: [{ module: $$module1$1, specifier: "../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/D:/Projects/portfolio/src/pages/portfolio.astro", "", "file:///D:/Projects/portfolio/");
const $$Portfolio = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Portfolio;
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<div class="hero bg-base-200">
            <div class="hero-content flex-col lg:flex-row-reverse">
                <img src="https://placeimg.com/260/400/arch" class="max-w-sm rounded-lg shadow-2xl">
                <div>
                    <h1 class="text-5xl font-bold">Portfolio Stuff!</h1>
                    <p class="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
                        exercitationem quasi.</p>
                    <button class="btn btn-primary">Get Started</button>
                </div>
            </div>
        </div>` })}`;
});

const $$file$1 = "D:/Projects/portfolio/src/pages/portfolio.astro";
const $$url$1 = "/portfolio";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Portfolio,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

!function () { var e, t, n, i, r = { passive: !0, capture: !0 }, a = new Date, o = function () { i = [], t = -1, e = null, f(addEventListener); }, c = function (i, r) { e || (e = r, t = i, n = new Date, f(removeEventListener), u()); }, u = function () { if (t >= 0 && t < n - a) { var r = { entryType: "first-input", name: e.type, target: e.target, cancelable: e.cancelable, startTime: e.timeStamp, processingStart: e.timeStamp + t }; i.forEach((function (e) { e(r); })), i = []; } }, s = function (e) { if (e.cancelable) { var t = (e.timeStamp > 1e12 ? new Date : performance.now()) - e.timeStamp; "pointerdown" == e.type ? function (e, t) { var n = function () { c(e, t), a(); }, i = function () { a(); }, a = function () { removeEventListener("pointerup", n, r), removeEventListener("pointercancel", i, r); }; addEventListener("pointerup", n, r), addEventListener("pointercancel", i, r); }(t, e) : c(t, e); } }, f = function (e) { ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function (t) { return e(t, s, r) })); }, p = "hidden" === document.visibilityState ? 0 : 1 / 0; addEventListener("visibilitychange", (function e(t) { "hidden" === document.visibilityState && (p = t.timeStamp, removeEventListener("visibilitychange", e, !0)); }), !0); o(), self.webVitals = { firstInputPolyfill: function (e) { i.push(e), u(); }, resetFirstInputPolyfill: o, get firstHiddenTime() { return p } }; }();

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const PKG_NAME = "@astrojs/image";
const ROUTE_PATTERN = "/_image";
const OUTPUT_DIR = "/_image";

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

function ensureDir(dir) {
  fs$1.mkdirSync(dir, { recursive: true });
}
function propsToFilename({ src, width, height, format }) {
  const ext = path.extname(src);
  let filename = src.replace(ext, "");
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

async function ssgBuild({ loader, staticImages, srcDir, outDir }) {
  const inputFiles = /* @__PURE__ */ new Set();
  for await (const [src, transformsMap] of staticImages) {
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
      console.warn(`"${src}" image could not be fetched`);
      continue;
    }
    const transforms = Array.from(transformsMap.entries());
    for await (const [filename, transform] of transforms) {
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
    }
  }
  for await (const original of inputFiles) {
    const to = original.replace(fileURLToPath(srcDir), fileURLToPath(outDir));
    await ensureDir(path.dirname(to));
    await fs.copyFile(original, to);
  }
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
  const isDev = (_b = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{SSR:true,}))) == null ? void 0 : _b.DEV;
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
      "astro:server:setup": async () => {
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
            await ssgBuild({ loader, staticImages, srcDir: _config.srcDir, outDir: dir });
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

createMetadata("/@fs/D:/Projects/portfolio/node_modules/@astrojs/image/components/Image.astro", { modules: [{ module: $$module1, specifier: "../dist/index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/D:/Projects/portfolio/node_modules/@astrojs/image/components/Image.astro", "", "file:///D:/Projects/portfolio/");
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Image;
  const { loading = "lazy", decoding = "async", ...props } = Astro2.props;
  const attrs = await getImage(props);
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<img${spreadAttributes(attrs, "attrs", { "class": "astro-C563XDD6" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}>

`;
});

createMetadata("/@fs/D:/Projects/portfolio/node_modules/@astrojs/image/components/Picture.astro", { modules: [{ module: $$module1, specifier: "../dist/index.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/D:/Projects/portfolio/node_modules/@astrojs/image/components/Picture.astro", "", "file:///D:/Projects/portfolio/");
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
  return renderTemplate`${maybeRenderHead($$result)}<picture${spreadAttributes(attrs, "attrs", { "class": "astro-L4E2UYFH" })}>
	${sources.map((attrs2) => renderTemplate`<source${spreadAttributes(attrs2, "attrs", { "class": "astro-L4E2UYFH" })}${addAttribute(sizes, "sizes")}>`)}
	<img${spreadAttributes(image, "image", { "class": "astro-L4E2UYFH" })}${addAttribute(loading, "loading")}${addAttribute(decoding, "decoding")}${addAttribute(alt, "alt")}>
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
createMetadata("/@fs/D:/Projects/portfolio/src/layouts/BlogPost.astro", { modules: [{ module: $$module1$2, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module2, specifier: "../components/Header.astro", assert: {} }, { module: $$module3, specifier: "../components/Footer.astro", assert: {} }, { module: $$module4, specifier: "@astrojs/image/components", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/D:/Projects/portfolio/src/layouts/BlogPost.astro", "", "file:///D:/Projects/portfolio/");
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const {
    content: { title, description, publishDate, updatedDate, heroImage, readTime }
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
  return renderTemplate(_a || (_a = __template(['<html data-theme="wireframe" lang="en-us">\n\n<head>\n	', "\n\n", '</head>\n\n<body class="flex flex-col min-h-screen">\n	', `
	<main class="flex-auto">
		<!--Exit Button -->
		<!--TODO: Looks HORRIBLE on mobile  -->
		<button class="btn btn-circle btn-outline m-3 md:m-6 lg:m-10" onclick="location.href='/blog'">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		</button>
		<article class="prose prose-lg container px-4 mx-auto pb-4 md:pb-5 lg:pb-7">
			`, '\n\n			<h1 class="text-3xl">', '</h1>\n\n			<div class="container columns-3">\n				<p class="text-primary text-sm m-0">Posted ', '</p>\n				<p class="text-primary text-sm m-0 text-left">Read time: ', '</p>\n				<p class="text-primary text-sm m-0 text-right">', " ", '\n				</p>\n\n			</div>\n			<div class="divider m-0"></div>\n			', ' <!-- This is where blog content goes -->\n		</article>\n		<button type="button" data-mdb-ripple="true" data-mdb-ripple-color="light" class="p-3 btn transition duration-700 ease-in-out opacity-0 bottom-5 right-5 fixed invisible" id="btn-back-to-top">\n			<svg aria-hidden="true" focusable="false" data-prefix="fas" class="w-4 h-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">\n				<path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z">\n				</path>\n			</svg>\n		</button>\n	</main>\n	', `
<script>
	// Get the button
	let mybutton = document.getElementById("btn-back-to-top");

	var body = document.body,
		html = document.documentElement;

	var height = Math.max(body.scrollHeight, body.offsetHeight,
		html.clientHeight, html.scrollHeight, html.offsetHeight);

	var footerHeight = height - 1400 //have button display about the footer when scrolled down
	//BUG Doesn't work on mobile

	console.log(height, footerHeight)

	// When the user scrolls down 20px from the top of the document, show the button
	window.onscroll = function () {
		scrollFunction();
	};

	function scrollFunction() {
		if (
			document.documentElement.scrollTop > 20 && document.documentElement.scrollTop < footerHeight
		) {
			mybutton.style.visibility = "visible";
			mybutton.style.opacity = "1";
			mybutton.style.bottom = '20px';
		} else if (document.documentElement.scrollTop >= footerHeight) {
			mybutton.style.bottom = '80px';
			mybutton.style.opacity = "1";
			mybutton.style.visibility = "visible";
		}
		else {
			mybutton.style.opacity = "0";
			mybutton.style.visibility = "hidden";
		}
	}
	// When the user clicks on the button, scroll to the top of the document
	mybutton.addEventListener("click", backToTop);

	function backToTop() {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	}
<\/script>

</body></html>`])), renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description }), renderHead($$result), renderComponent($$result, "Header", $$Header, {}), heroImageAsset && renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": heroImageAsset.default, "alt": "" })}`, title, publishDate && renderTemplate`<time>${publishDate}</time>`, readTime, lastUpdatedOn, updatedDateCheck && renderTemplate`<time>${updatedDateCheck}</time>`, renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
});

const html$5 = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.</p>\n<p>Morbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.</p>\n<p>Mollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.</p>\n<p>Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.</p>\n<p>Tempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.</p>";

				const frontmatter$5 = {"layout":"../layouts/BlogPost.astro","title":"About Me","description":"Lorem ipsum dolor sit amet","updatedDate":"August 08 2022","heroImage":"/assets/placeholder-about.jpg"};
				const file$5 = "D:/Projects/portfolio/src/pages/about.md";
				const url$5 = "/about";
				function rawContent$5() {
					return "\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.\n\nMorbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.\n\nMollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.\n\nMattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.\n\nTempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.";
				}
				function compiledContent$5() {
					return html$5;
				}
				function getHeadings$5() {
					return [];
				}
				function getHeaders$5() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$5();
				}				async function Content$5() {
					const { layout, ...content } = frontmatter$5;
					content.file = file$5;
					content.url = url$5;
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
					const contentFragment = createVNode(Fragment, { 'set:html': html$5 });
					return createVNode($$BlogPost, {
									content,
									frontmatter: content,
									headings: getHeadings$5(),
									rawContent: rawContent$5,
									compiledContent: compiledContent$5,
									'server:root': true,
									children: contentFragment
								});
				}

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$5,
	file: file$5,
	url: url$5,
	rawContent: rawContent$5,
	compiledContent: compiledContent$5,
	getHeadings: getHeadings$5,
	getHeaders: getHeaders$5,
	Content: Content$5,
	default: Content$5
}, Symbol.toStringTag, { value: 'Module' }));

const html$4 = "<p><strong>TLDR:</strong> I finally started creating my own portfolio website to showcase all my projects. It’s built with Astro, Tailwind, and hosted on Vercel. Today I focused on creating a design doc, building a basic layout with placeholders, and figuring out how to make my site unique.</p>\n<h2 id=\"the-start-of-a-never-ending-process\">The start of a never ending process…</h2>\n<p>Hi! I’m John.</p>\n<p>Currently I work as a Data Analyst but I’m working towards becoming a Front End Developer with a focus on UX Design.</p>\n<p>My goal by making my own portfolio website is not to just showcase my projects, but to document my thought and design process behind each one. This is how I work normally so it just makes sense to include it. My portfolio is the start of a very long process as I plan to update it monthly with my works.</p>\n<p>My main goals are to make sure I:</p>\n<ul>\n<li>Create something unique that isn’t just copy pasted UI components from the internet</li>\n<li>Stand out as a frontend developer (is this even possible?)</li>\n<li>Work on it regularly and keep it updated</li>\n<li>Focus on mobile first design</li>\n<li>Include documentation on how the site was created</li>\n</ul>\n<h2 id=\"standing-out\">Standing out</h2>\n<p>I love design. Specifically the user experience. Everytime I use a new product I am immediately thinking about why it is the way it is. Could it be easier to use? This seems like a poor choice this for design, why did they decide to do it this way?</p>\n<p>To try and showcase that, I decided my portfolio should include my design docs, thought processes, and iterations of the websites design. My guess is no one would read or look through 20 photos of the same website looking different each time.</p>\n<p>That’s when I thought:</p>\n<blockquote>\n<p>Why not just build this into the website in an interactive way?</p>\n</blockquote>\n<p>Or put another way, include buttons that allow the user to quickly swap between design iterations of the website itself. Each time they click the button, the whole website transforms back into an older (or newer) version of itself.</p>\n<p>That way I can show how the website has come together over time in a fun and interesting way, without subjecting visitors to a boring slideshow of UI components.</p>\n<p>Before that can even happen, I need to actually create a first version, so I figured out what I wanted to include:</p>\n<h4 id=\"website-layout\">Website Layout</h4>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<table><thead><tr><th>Web Page</th><th>Description</th></tr></thead><tbody><tr><td>Home</td><td>Where the user lands, first impressions count!</td></tr><tr><td>Blog</td><td>Central place for all my blog posts</td></tr><tr><td>Portfolio</td><td>List of all my projects to explore</td></tr><tr><td>About Me</td><td>List my contacts and a bit about myself</td></tr></tbody></table>\n<p>Then I determined what I wanted to use to build it:</p>\n<h4 id=\"tech-stack\">Tech Stack</h4>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<table><thead><tr><th>Tech</th><th>For</th><th>Why</th></tr></thead><tbody><tr><td>Astro</td><td>Web Framework</td><td>Easy SSR and great for content</td></tr><tr><td>Tailwind</td><td>CSS</td><td>Cause normal css is a pain</td></tr><tr><td>Vercel</td><td>Hosting</td><td>Free and asy push from GitHub</td></tr><tr><td>Typescript</td><td>Language</td><td>Because I need to learn it</td></tr></tbody></table>\n<p>And finally I could start building a site with some placeholders! My first go-around has a ton of placeholders so I could build something quick and dirty. The next challenge is figuring out how my unique website transformations will work before I get too far ahead. I don’t want to have to rebuild everything just because it doesn’t work.</p>\n<h2 id=\"closing\">Closing</h2>\n<p>I hope this first blog post provided some insite into what I hope to accomplish and how I went about planning for it. I plan on posting monthly updates that include future updates, design documents, screenshots, and more.</p>\n<p>Take care!</p>\n<p>John C. Waters</p>\n<p><em>Note to self: add buttons here to go back and forth between blogs! :)</em></p>";

				const frontmatter$4 = {"layout":"../../layouts/BlogPost.astro","title":"Creating My Portfolio - August 2022","description":"I finally started creating my own portfolio website to showcase all my projects. It's built with Astro, Svelte, Tailwind, and hosted on Vercel. Today I focused on creating a design doc, building a basic layout with placeholders, and figuring out how to make my site unique.","publishDate":"Aug 14 2022","heroImage":"/assets/placeholder-hero.jpg","updatedDate":"Aug 17 2022","readTime":"5 min"};
				const file$4 = "D:/Projects/portfolio/src/pages/blog/Creating-My-Portfolio-August-2022.md";
				const url$4 = "/blog/Creating-My-Portfolio-August-2022";
				function rawContent$4() {
					return "\n**TLDR:** I finally started creating my own portfolio website to showcase all my projects. It's built with Astro, Tailwind, and hosted on Vercel. Today I focused on creating a design doc, building a basic layout with placeholders, and figuring out how to make my site unique.\n\n## The start of a never ending process...\n\nHi! I'm John. \n\nCurrently I work as a Data Analyst but I'm working towards becoming a Front End Developer with a focus on UX Design.\n\nMy goal by making my own portfolio website is not to just showcase my projects, but to document my thought and design process behind each one. This is how I work normally so it just makes sense to include it. My portfolio is the start of a very long process as I plan to update it monthly with my works.\n\nMy main goals are to make sure I:\n\n* Create something unique that isn’t just copy pasted UI components from the internet\n* Stand out as a frontend developer (is this even possible?)\n* Work on it regularly and keep it updated\n* Focus on mobile first design\n* Include documentation on how the site was created\n\n## Standing out\n\nI love design. Specifically the user experience. Everytime I use a new product I am immediately thinking about why it is the way it is. Could it be easier to use? This seems like a poor choice this for design, why did they decide to do it this way?\n\nTo try and showcase that, I decided my portfolio should include my design docs, thought processes, and iterations of the websites design. My guess is no one would read or look through 20 photos of the same website looking different each time.\n\nThat's when I thought: \n>Why not just build this into the website in an interactive way?\n\nOr put another way, include buttons that allow the user to quickly swap between design iterations of the website itself. Each time they click the button, the whole website transforms back into an older (or newer) version of itself.\n\nThat way I can show how the website has come together over time in a fun and interesting way, without subjecting visitors to a boring slideshow of UI components.\n\nBefore that can even happen, I need to actually create a first version, so I figured out what I wanted to include:\n\n#### Website Layout\n\n| Web Page   | Description    | \n| --------  | -------- | \n| Home | Where the user lands, first impressions count!| \n| Blog | Central place for all my blog posts |\n| Portfolio | List of all my projects to explore |\n| About Me | List my contacts and a bit about myself |\n\nThen I determined what I wanted to use to build it:\n\n#### Tech Stack\n\n| Tech   | For    | Why   |\n| --------  | -------- | ------ |\n| Astro | Web Framework | Easy SSR and great for content |\n| Tailwind | CSS | Cause normal css is a pain |\n| Vercel | Hosting | Free and asy push from GitHub |\n| Typescript | Language | Because I need to learn it |\n\nAnd finally I could start building a site with some placeholders! My first go-around has a ton of placeholders so I could build something quick and dirty. The next challenge is figuring out how my unique website transformations will work before I get too far ahead. I don't want to have to rebuild everything just because it doesn't work.\n\n## Closing\n\nI hope this first blog post provided some insite into what I hope to accomplish and how I went about planning for it. I plan on posting monthly updates that include future updates, design documents, screenshots, and more.\n\nTake care!\n\nJohn C. Waters\n\n*Note to self: add buttons here to go back and forth between blogs! :)*";
				}
				function compiledContent$4() {
					return html$4;
				}
				function getHeadings$4() {
					return [{"depth":2,"slug":"the-start-of-a-never-ending-process","text":"The start of a never ending process…"},{"depth":2,"slug":"standing-out","text":"Standing out"},{"depth":4,"slug":"website-layout","text":"Website Layout"},{"depth":4,"slug":"tech-stack","text":"Tech Stack"},{"depth":2,"slug":"closing","text":"Closing"}];
				}
				function getHeaders$4() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings$4();
				}				async function Content$4() {
					const { layout, ...content } = frontmatter$4;
					content.file = file$4;
					content.url = url$4;
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
					const contentFragment = createVNode(Fragment, { 'set:html': html$4 });
					return createVNode($$BlogPost, {
									content,
									frontmatter: content,
									headings: getHeadings$4(),
									rawContent: rawContent$4,
									compiledContent: compiledContent$4,
									'server:root': true,
									children: contentFragment
								});
				}

const _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter: frontmatter$4,
	file: file$4,
	url: url$4,
	rawContent: rawContent$4,
	compiledContent: compiledContent$4,
	getHeadings: getHeadings$4,
	getHeaders: getHeaders$4,
	Content: Content$4,
	default: Content$4
}, Symbol.toStringTag, { value: 'Module' }));

const html$3 = "<p>Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.</p>\n<h2 id=\"headings\">Headings</h2>\n<p>The following HTML <code>&#x3C;h1></code>—<code>&#x3C;h6></code> elements represent six levels of section headings. <code>&#x3C;h1></code> is the highest section level while <code>&#x3C;h6></code> is the lowest.</p>\n<h1 id=\"h1\">H1</h1>\n<h2 id=\"h2\">H2</h2>\n<h3 id=\"h3\">H3</h3>\n<h4 id=\"h4\">H4</h4>\n<h5 id=\"h5\">H5</h5>\n<h6 id=\"h6\">H6</h6>\n<h2 id=\"paragraph\">Paragraph</h2>\n<p>Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.</p>\n<p>Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.</p>\n<h2 id=\"images\">Images</h2>\n<p><img src=\"/placeholder-social.jpg\" alt=\"This is a placeholder image description\"></p>\n<h2 id=\"blockquotes\">Blockquotes</h2>\n<p>The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a <code>footer</code> or <code>cite</code> element, and optionally with in-line changes such as annotations and abbreviations.</p>\n<h4 id=\"blockquote-without-attribution\">Blockquote without attribution</h4>\n<blockquote>\n<p>Tiam, ad mint andaepu dandae nostion secatur sequo quae.<br>\n<strong>Note</strong> that you can use <em>Markdown syntax</em> within a blockquote.</p>\n</blockquote>\n<h4 id=\"blockquote-with-attribution\">Blockquote with attribution</h4>\n<blockquote>\n<p>Don’t communicate by sharing memory, share memory by communicating.<br>\n— <cite>Rob Pike<sup><a href=\"#user-content-fn-1\" id=\"user-content-fnref-1\" data-footnote-ref=\"\" aria-describedby=\"footnote-label\">1</a></sup></cite></p>\n</blockquote>\n<h2 id=\"tables\">Tables</h2>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<table><thead><tr><th>Italics</th><th>Bold</th><th>Code</th></tr></thead><tbody><tr><td><em>italics</em></td><td><strong>bold</strong></td><td><code>code</code></td></tr></tbody></table>\n<h2 id=\"code-blocks\">Code Blocks</h2>\n<pre is:raw=\"\" class=\"astro-code\" style=\"background-color: #0d1117; overflow-x: auto;\"><code><span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;!</span><span style=\"color: #7EE787\">doctype</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">html</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;</span><span style=\"color: #7EE787\">html</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">lang</span><span style=\"color: #C9D1D9\">=</span><span style=\"color: #A5D6FF\">\"en\"</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;</span><span style=\"color: #7EE787\">head</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  &#x3C;</span><span style=\"color: #7EE787\">meta</span><span style=\"color: #C9D1D9\"> </span><span style=\"color: #79C0FF\">charset</span><span style=\"color: #C9D1D9\">=</span><span style=\"color: #A5D6FF\">\"utf-8\"</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  &#x3C;</span><span style=\"color: #7EE787\">title</span><span style=\"color: #C9D1D9\">>Example HTML5 Document&#x3C;/</span><span style=\"color: #7EE787\">title</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;/</span><span style=\"color: #7EE787\">head</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;</span><span style=\"color: #7EE787\">body</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">  &#x3C;</span><span style=\"color: #7EE787\">p</span><span style=\"color: #C9D1D9\">>Test&#x3C;/</span><span style=\"color: #7EE787\">p</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;/</span><span style=\"color: #7EE787\">body</span><span style=\"color: #C9D1D9\">></span></span>\n<span class=\"line\"><span style=\"color: #C9D1D9\">&#x3C;/</span><span style=\"color: #7EE787\">html</span><span style=\"color: #C9D1D9\">></span></span></code></pre>\n<h2 id=\"list-types\">List Types</h2>\n<h4 id=\"ordered-list\">Ordered List</h4>\n<ol>\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ol>\n<h4 id=\"unordered-list\">Unordered List</h4>\n<ul>\n<li>List item</li>\n<li>Another item</li>\n<li>And another item</li>\n</ul>\n<h4 id=\"nested-list\">Nested list</h4>\n<ul>\n<li>Fruit\n<ul>\n<li>Apple</li>\n<li>Orange</li>\n<li>Banana</li>\n</ul>\n</li>\n<li>Dairy\n<ul>\n<li>Milk</li>\n<li>Cheese</li>\n</ul>\n</li>\n</ul>\n<h2 id=\"other-elements--abbr-sub-sup-kbd-mark\">Other Elements — abbr, sub, sup, kbd, mark</h2>\n<p><abbr title=\"Graphics Interchange Format\">GIF</abbr> is a bitmap image format.</p>\n<p>H<sub>2</sub>O</p>\n<p>X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup></p>\n<p>Press <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> to end the session.</p>\n<p>Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.</p>\n<section data-footnotes=\"\" class=\"footnotes\"><h2 id=\"footnote-label\" class=\"sr-only\">Footnotes</h2>\n<ol>\n<li id=\"user-content-fn-1\">\n<p>The above quote is excerpted from Rob Pike’s <a href=\"https://www.youtube.com/watch?v=PAAkCSZUG1c\">talk</a> during Gopherfest, November 18, 2015. <a href=\"#user-content-fnref-1\" data-footnote-backref=\"\" class=\"data-footnote-backref\" aria-label=\"Back to content\">↩</a></p>\n</li>\n</ol>\n</section>";

				const frontmatter$3 = {"layout":"../../layouts/BlogPost.astro","title":"Markdown Style Guide","description":"Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.","publishDate":"Jul 01 2022","heroImage":"/assets/placeholder-hero.jpg"};
				const file$3 = "D:/Projects/portfolio/src/pages/blog/markdown-style-guide.md";
				const url$3 = "/blog/markdown-style-guide";
				function rawContent$3() {
					return "\nHere is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.\n\n## Headings\n\nThe following HTML `<h1>`—`<h6>` elements represent six levels of section headings. `<h1>` is the highest section level while `<h6>` is the lowest.\n\n# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n\n## Paragraph\n\nXerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.\n\nItatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.\n\n## Images\n\n![This is a placeholder image description](/placeholder-social.jpg)\n\n## Blockquotes\n\nThe blockquote element represents content that is quoted from another source, optionally with a citation which must be within a `footer` or `cite` element, and optionally with in-line changes such as annotations and abbreviations.\n\n#### Blockquote without attribution\n\n> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  \n> **Note** that you can use *Markdown syntax* within a blockquote.\n\n#### Blockquote with attribution\n\n> Don't communicate by sharing memory, share memory by communicating.<br>\n> — <cite>Rob Pike[^1]</cite>\n\n[^1]: The above quote is excerpted from Rob Pike's [talk](https://www.youtube.com/watch?v=PAAkCSZUG1c) during Gopherfest, November 18, 2015.\n\n## Tables\n\n| Italics   | Bold     | Code   |\n| --------  | -------- | ------ |\n| *italics* | **bold** | `code` |\n\n## Code Blocks\n\n```html\n<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Example HTML5 Document</title>\n</head>\n<body>\n  <p>Test</p>\n</body>\n</html>\n```\n\n## List Types\n\n#### Ordered List\n\n1. First item\n2. Second item\n3. Third item\n\n#### Unordered List\n\n* List item\n* Another item\n* And another item\n\n#### Nested list\n\n* Fruit\n  * Apple\n  * Orange\n  * Banana\n* Dairy\n  * Milk\n  * Cheese\n\n## Other Elements — abbr, sub, sup, kbd, mark\n\n<abbr title=\"Graphics Interchange Format\">GIF</abbr> is a bitmap image format.\n\nH<sub>2</sub>O\n\nX<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>\n\nPress <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> to end the session.\n\nMost <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.\n";
				}
				function compiledContent$3() {
					return html$3;
				}
				function getHeadings$3() {
					return [{"depth":2,"slug":"headings","text":"Headings"},{"depth":1,"slug":"h1","text":"H1"},{"depth":2,"slug":"h2","text":"H2"},{"depth":3,"slug":"h3","text":"H3"},{"depth":4,"slug":"h4","text":"H4"},{"depth":5,"slug":"h5","text":"H5"},{"depth":6,"slug":"h6","text":"H6"},{"depth":2,"slug":"paragraph","text":"Paragraph"},{"depth":2,"slug":"images","text":"Images"},{"depth":2,"slug":"blockquotes","text":"Blockquotes"},{"depth":4,"slug":"blockquote-without-attribution","text":"Blockquote without attribution"},{"depth":4,"slug":"blockquote-with-attribution","text":"Blockquote with attribution"},{"depth":2,"slug":"tables","text":"Tables"},{"depth":2,"slug":"code-blocks","text":"Code Blocks"},{"depth":2,"slug":"list-types","text":"List Types"},{"depth":4,"slug":"ordered-list","text":"Ordered List"},{"depth":4,"slug":"unordered-list","text":"Unordered List"},{"depth":4,"slug":"nested-list","text":"Nested list"},{"depth":2,"slug":"other-elements--abbr-sub-sup-kbd-mark","text":"Other Elements — abbr, sub, sup, kbd, mark"},{"depth":2,"slug":"footnote-label","text":"Footnotes"}];
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
									content,
									frontmatter: content,
									headings: getHeadings$3(),
									rawContent: rawContent$3,
									compiledContent: compiledContent$3,
									'server:root': true,
									children: contentFragment
								});
				}

const _page7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
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

const html$2 = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.</p>\n<p>Morbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.</p>\n<p>Mollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.</p>\n<p>Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.</p>\n<p>Tempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.</p>";

				const frontmatter$2 = {"layout":"../../layouts/BlogPost.astro","title":"Second post","description":"Lorem ipsum dolor sit amet","publishDate":"Jul 22 2022","heroImage":"/assets/placeholder-hero.jpg"};
				const file$2 = "D:/Projects/portfolio/src/pages/blog/second-post.md";
				const url$2 = "/blog/second-post";
				function rawContent$2() {
					return "\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.\n\nMorbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.\n\nMollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.\n\nMattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.\n\nTempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.";
				}
				function compiledContent$2() {
					return html$2;
				}
				function getHeadings$2() {
					return [];
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
									content,
									frontmatter: content,
									headings: getHeadings$2(),
									rawContent: rawContent$2,
									compiledContent: compiledContent$2,
									'server:root': true,
									children: contentFragment
								});
				}

const _page8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
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

const html$1 = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.</p>\n<p>Morbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.</p>\n<p>Mollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.</p>\n<p>Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.</p>\n<p>Tempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.</p>";

				const frontmatter$1 = {"layout":"../../layouts/BlogPost.astro","title":"First post","description":"Lorem ipsum dolor sit amet","publishDate":"Jul 08 2022","heroImage":"/assets/placeholder-hero.jpg","updatedDate":"Aug 14 2022"};
				const file$1 = "D:/Projects/portfolio/src/pages/blog/first-post.md";
				const url$1 = "/blog/first-post";
				function rawContent$1() {
					return "\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.\n\nMorbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.\n\nMollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.\n\nMattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.\n\nTempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.";
				}
				function compiledContent$1() {
					return html$1;
				}
				function getHeadings$1() {
					return [];
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
									content,
									frontmatter: content,
									headings: getHeadings$1(),
									rawContent: rawContent$1,
									compiledContent: compiledContent$1,
									'server:root': true,
									children: contentFragment
								});
				}

const _page9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
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

const html = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.</p>\n<p>Morbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.</p>\n<p>Mollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.</p>\n<p>Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.</p>\n<p>Tempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.</p>";

				const frontmatter = {"layout":"../../layouts/BlogPost.astro","title":"Third post","description":"Lorem ipsum dolor sit amet","publishDate":"Jul 15 2022","heroImage":"/assets/placeholder-hero.jpg"};
				const file = "D:/Projects/portfolio/src/pages/blog/third-post.md";
				const url = "/blog/third-post";
				function rawContent() {
					return "\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Adipiscing enim eu turpis egestas pretium. Euismod elementum nisi quis eleifend quam adipiscing. In hac habitasse platea dictumst vestibulum. Sagittis purus sit amet volutpat. Netus et malesuada fames ac turpis egestas. Eget magna fermentum iaculis eu non diam phasellus vestibulum lorem. Varius sit amet mattis vulputate enim. Habitasse platea dictumst quisque sagittis. Integer quis auctor elit sed vulputate mi. Dictumst quisque sagittis purus sit amet.\n\nMorbi tristique senectus et netus. Id semper risus in hendrerit gravida rutrum quisque non tellus. Habitasse platea dictumst quisque sagittis purus sit amet. Tellus molestie nunc non blandit massa. Cursus vitae congue mauris rhoncus. Accumsan tortor posuere ac ut. Fringilla urna porttitor rhoncus dolor. Elit ullamcorper dignissim cras tincidunt lobortis. In cursus turpis massa tincidunt dui ut ornare lectus. Integer feugiat scelerisque varius morbi enim nunc. Bibendum neque egestas congue quisque egestas diam. Cras ornare arcu dui vivamus arcu felis bibendum. Dignissim suspendisse in est ante in nibh mauris. Sed tempus urna et pharetra pharetra massa massa ultricies mi.\n\nMollis nunc sed id semper risus in. Convallis a cras semper auctor neque. Diam sit amet nisl suscipit. Lacus viverra vitae congue eu consequat ac felis donec. Egestas integer eget aliquet nibh praesent tristique magna sit amet. Eget magna fermentum iaculis eu non diam. In vitae turpis massa sed elementum. Tristique et egestas quis ipsum suspendisse ultrices. Eget lorem dolor sed viverra ipsum. Vel turpis nunc eget lorem dolor sed viverra. Posuere ac ut consequat semper viverra nam. Laoreet suspendisse interdum consectetur libero id faucibus. Diam phasellus vestibulum lorem sed risus ultricies tristique. Rhoncus dolor purus non enim praesent elementum facilisis. Ultrices tincidunt arcu non sodales neque. Tempus egestas sed sed risus pretium quam vulputate. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Fringilla urna porttitor rhoncus dolor purus non. Amet dictum sit amet justo donec enim.\n\nMattis ullamcorper velit sed ullamcorper morbi tincidunt. Tortor posuere ac ut consequat semper viverra. Tellus mauris a diam maecenas sed enim ut sem viverra. Venenatis urna cursus eget nunc scelerisque viverra mauris in. Arcu ac tortor dignissim convallis aenean et tortor at. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Egestas tellus rutrum tellus pellentesque eu. Fusce ut placerat orci nulla pellentesque dignissim enim sit amet. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam. Id donec ultrices tincidunt arcu. Id cursus metus aliquam eleifend mi.\n\nTempus quam pellentesque nec nam aliquam sem. Risus at ultrices mi tempus imperdiet. Id porta nibh venenatis cras sed felis eget velit. Ipsum a arcu cursus vitae. Facilisis magna etiam tempor orci eu lobortis elementum. Tincidunt dui ut ornare lectus sit. Quisque non tellus orci ac. Blandit libero volutpat sed cras. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Egestas integer eget aliquet nibh praesent tristique magna.";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [];
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
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}

const _page10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
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

const $$metadata = createMetadata("/@fs/D:/Projects/portfolio/src/pages/blog.astro", { modules: [{ module: $$module1$1, specifier: "../layouts/DefaultPage.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/D:/Projects/portfolio/src/pages/blog.astro", "", "file:///D:/Projects/portfolio/");
const $$Blog = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Blog;
  const posts = (await Astro2.glob(/* #__PURE__ */ Object.assign({"./blog/Creating-My-Portfolio-August-2022.md": () => Promise.resolve().then(() => _page6),"./blog/first-post.md": () => Promise.resolve().then(() => _page9),"./blog/markdown-style-guide.md": () => Promise.resolve().then(() => _page7),"./blog/second-post.md": () => Promise.resolve().then(() => _page8),"./blog/third-post.md": () => Promise.resolve().then(() => _page10)}), () => "./blog/*.{md,mdx}")).sort(
    (a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf()
  );
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": () => renderTemplate`${maybeRenderHead($$result)}<container class="">

			${posts.map((post) => renderTemplate`<a class="card bg-base-100 shadow-xl mx-auto m-6 w-11/12 md:w-96"${addAttribute(post.url, "href")}>

				<figure><img src="https://placeimg.com/400/225/arch" alt="Shoes"></figure>
				<div class="card-body">
					<h2 class="card-title">
						${post.frontmatter.title}

					</h2>

					<div class="badge badge-secondary"><time${addAttribute(post.frontmatter.publishDate, "datetime")}>
							${new Date(post.frontmatter.publishDate).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })}
						</time></div>

					<p>${post.frontmatter.description.substring(0, 120) + "..."}</p>
					<div class="card-actions justify-end">
						<div class="badge badge-outline">Fashion</div>
						<div class="badge badge-outline">Products</div>
					</div>
				</div>
			</a>`)}
		</container>` })}`;
});

const $$file = "D:/Projects/portfolio/src/pages/blog.astro";
const $$url = "/blog";

const _page11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$Blog,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['node_modules/@astrojs/image/dist/endpoints/prod.js', _page0],['src/pages/index.astro', _page1],['src/pages/portfolio.astro', _page2],['src/pages/polyfill.js', _page3],['src/pages/vitals.js', _page4],['src/pages/about.md', _page5],['src/pages/blog/Creating-My-Portfolio-August-2022.md', _page6],['src/pages/blog/markdown-style-guide.md', _page7],['src/pages/blog/second-post.md', _page8],['src/pages/blog/first-post.md', _page9],['src/pages/blog/third-post.md', _page10],['src/pages/blog.astro', _page11],]);
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

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/image/dist/endpoints/prod.js","pathname":"/_image","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css"],"scripts":[],"routeData":{"route":"/portfolio","type":"page","pattern":"^\\/portfolio\\/?$","segments":[[{"content":"portfolio","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/portfolio.astro","pathname":"/portfolio","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"routeData":{"route":"/polyfill","type":"endpoint","pattern":"^\\/polyfill$","segments":[[{"content":"polyfill","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/polyfill.js","pathname":"/polyfill","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"routeData":{"route":"/vitals","type":"endpoint","pattern":"^\\/vitals$","segments":[[{"content":"vitals","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/vitals.js","pathname":"/vitals","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css","assets/c06f0412.67a900e6.css"],"scripts":[],"routeData":{"route":"/about","type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.md","pathname":"/about","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css","assets/c06f0412.67a900e6.css"],"scripts":[],"routeData":{"route":"/blog/creating-my-portfolio-august-2022","type":"page","pattern":"^\\/blog\\/Creating-My-Portfolio-August-2022\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"Creating-My-Portfolio-August-2022","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/Creating-My-Portfolio-August-2022.md","pathname":"/blog/Creating-My-Portfolio-August-2022","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css","assets/c06f0412.67a900e6.css"],"scripts":[],"routeData":{"route":"/blog/markdown-style-guide","type":"page","pattern":"^\\/blog\\/markdown-style-guide\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"markdown-style-guide","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/markdown-style-guide.md","pathname":"/blog/markdown-style-guide","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css","assets/c06f0412.67a900e6.css"],"scripts":[],"routeData":{"route":"/blog/second-post","type":"page","pattern":"^\\/blog\\/second-post\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"second-post","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/second-post.md","pathname":"/blog/second-post","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css","assets/c06f0412.67a900e6.css"],"scripts":[],"routeData":{"route":"/blog/first-post","type":"page","pattern":"^\\/blog\\/first-post\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"first-post","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/first-post.md","pathname":"/blog/first-post","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css","assets/c06f0412.67a900e6.css"],"scripts":[],"routeData":{"route":"/blog/third-post","type":"page","pattern":"^\\/blog\\/third-post\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"third-post","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/third-post.md","pathname":"/blog/third-post","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/f67b7528.3654f34b.css","assets/c06f0412.67a900e6.css"],"scripts":[],"routeData":{"route":"/blog","type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog.astro","pathname":"/blog","_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.js","D:/Projects/portfolio/src/assets/placeholder-about.jpg":"chunks/placeholder-about.ed9d509c.mjs","D:/Projects/portfolio/src/assets/placeholder-hero.jpg":"chunks/placeholder-hero.5dc9e66a.mjs","@astrojs/svelte/client.js":"client.b27523fa.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/c06f0412.67a900e6.css","/assets/f67b7528.3654f34b.css","/astro.svg","/background.svg","/client.b27523fa.js","/placeholder-social.jpg"]}), {
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
