/* empty css                           */import { c as createAstro, d as createComponent, r as renderTemplate, f as addAttribute, m as maybeRenderHead, g as renderComponent, h as renderSlot, i as defineStyleVars } from '../astro_101ab9b5.mjs';
import 'html-escaper';
import 'clsx';
import '@astrojs/internal-helpers/path';
import { $ as $$Image } from './image-endpoint_acd13e75.mjs';
import 'mime/lite.js';
import '../astro-assets-services_9090e3e9.mjs';

const $$Astro$7 = createAstro("https://johncwaters.com");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const { title, description, image = "/placeholder-social.jpg" } = Astro2.props;
  return renderTemplate`<!-- Global Metadata --><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/svg+xml" href="/logos/Favicon No Background.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><!-- Primary Meta Tags --><title>${title}</title><meta name="title"${addAttribute(title, "content")}><meta name="description"${addAttribute(description, "content")}><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(Astro2.url, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(new URL(image, Astro2.url), "content")}><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"${addAttribute(Astro2.url, "content")}><meta property="twitter:title"${addAttribute(title, "content")}><meta property="twitter:description"${addAttribute(description, "content")}><meta property="twitter:image"${addAttribute(new URL(image, Astro2.url), "content")}>`;
}, "D:/Projects/portfolio/src/components/BaseHead.astro", void 0);

const $$Astro$6 = createAstro("https://johncwaters.com");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Footer;
  return renderTemplate`${maybeRenderHead()}<div class="footer items-center p-4 bg-neutral text-neutral-content myFooter"><div class="items-center grid-flow-col"><p>Designed & Built by John C. Waters</p></div><div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end pr-4"><a href="https://twitter.com/johncwaters" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a></div></div>`;
}, "D:/Projects/portfolio/src/components/Footer.astro", void 0);

const SITE_TITLE = "John C. Waters";
const SITE_DESCRIPTION = "Welcome to my website!";

const $$Astro$5 = createAstro("https://johncwaters.com");
const $$DefaultPage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$DefaultPage;
  return renderTemplate`<html data-theme="wireframe" lang="en-us" class="scroll-smooth">${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}<!--<GoogleAnalytics id="G-QP2FLYGVL3" />-->${maybeRenderHead()}<main class="flex flex-col min-h-screen">${renderSlot($$result, $$slots["default"])}<!-- Body Stuff goes here --></main><footer>${renderComponent($$result, "Footer", $$Footer, {})}</footer></html>`;
}, "D:/Projects/portfolio/src/layouts/DefaultPage.astro", void 0);

const $$Astro$4 = createAstro("https://johncwaters.com");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Header;
  const { animDelay = "0s" } = Astro2.props;
  const $$definedVars = defineStyleVars([{ animDelay }]);
  return renderTemplate`${maybeRenderHead()}<div class="navbar lineDown opacity-0 z-50" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><div class="navbar-start" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><div class="dropdown" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><a tabindex="0" class="btn btn-ghost lg:hidden" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}></path></svg></a><ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow rounded-box w-52 bg-neutral" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><li data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><a href="#staryportfolio" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}>Portfolio</a></li><!-- <li><a href="/blog">Blog</a></li> --></ul></div><a href="/" class="btn btn-ghost normal-case text-xl" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}>${SITE_TITLE}</a></div><div class="navbar-end pr-3 hidden lg:flex" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><ul class="menu menu-horizontal p-0 px-2 text-md" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><li data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}><a href="#staryportfolio" data-astro-cid-3ef6ksr2${addAttribute($$definedVars, "style")}>Portfolio</a></li><!-- <li><a href="/blog">Blog</a></li> --></ul></div></div>`;
}, "D:/Projects/portfolio/src/components/Header.astro", void 0);

const $$Astro$3 = createAstro("https://johncwaters.com");
const $$IndexHero = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$IndexHero;
  return renderTemplate`${maybeRenderHead()}<div class="max-h-screen overflow-hidden" data-astro-cid-nuli7jfj><div id="background" style="width: 100%;
    place-items: center;
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    z-index: 0;" data-astro-cid-nuli7jfj>${renderComponent($$result, "Header", $$Header, { "animDelay": "2.5s", "data-astro-cid-nuli7jfj": true })}<div class="hero-overlay bg-opacity-0" data-astro-cid-nuli7jfj></div><div class="hero-content sm:pt-32 pt-24" data-astro-cid-nuli7jfj><div class="text-left" data-astro-cid-nuli7jfj><h1 class="mb-5 sm:text-2xl text-2xl lineUp opacity-0 min-h-sc" style="--delay: 0.1;" data-astro-cid-nuli7jfj>
Hello there! My name is
</h1><h1 class="mb-5 sm:text-7xl text-5xl font-bold lineUp opacity-0" style="--delay: 0.6s;" data-astro-cid-nuli7jfj>
John C Waters.
</h1><h1 class="sm:text-7xl text-5xl font-bold lineUp opacity-0" style="--delay: 1.2s;" data-astro-cid-nuli7jfj>
I design and build solutions.
</h1></div></div><div class="scroll-button lineUp font-bold text-lg opacity-0" style="--delay: 2.5s;" tabindex="0" data-astro-cid-nuli7jfj><div class="arrow" data-astro-cid-nuli7jfj>↓</div> scroll
</div></div></div>`;
}, "D:/Projects/portfolio/src/components/smallparts/IndexHero.astro", void 0);

const watersMassageLogo = {"src":"/_astro/wmt_logo.844e22dc.png","width":2048,"height":894,"format":"png"};

const BlackWiddowTattooLogo = {"src":"/_astro/black_willow_tattoo_logo.f9c3cd5e.png","width":2048,"height":894,"format":"png"};

const $$Astro$2 = createAstro("https://johncwaters.com");
const $$PortfolioCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$PortfolioCard;
  const { image, title, message, hrefUrl } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="group relative w-96 rounded overflow-hidden card">${renderComponent($$result, "Image", $$Image, { "src": image, "alt": "", "class": "w-full h-full object-cover rounded" })}<div class="card-body absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-95 flex flex-col items-center justify-center transition-opacity duration-300 text-center opacity-0 group-hover:opacity-95"><h3 class="card-title">${title}</h3><p>${message}</p><a${addAttribute(hrefUrl, "href")} class="btn btn-outline">Learn More</a></div></div>`;
}, "D:/Projects/portfolio/src/components/PortfolioCard.astro", void 0);

const $$Astro$1 = createAstro("https://johncwaters.com");
const $$StaryPortfolio = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$StaryPortfolio;
  return renderTemplate`${maybeRenderHead()}<div id="staryportfolio" class="h-screen" data-astro-cid-77sagjxz><div class="backgroundStars" data-astro-cid-77sagjxz><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><span data-astro-cid-77sagjxz></span><div class="" data-astro-cid-77sagjxz><div class="hero" data-astro-cid-77sagjxz><div class="hero-content text-center sm:pt-32 pt-24" data-astro-cid-77sagjxz><div class="max-w-md sm:max-w-lg" data-astro-cid-77sagjxz><h1 class="mb-5 sm:text-6xl text-4xl font-bold lineUp opacity-0" style="--delay: 0.1s;" data-astro-cid-77sagjxz>
My Works
</h1><p class="mb-5 text-2xl lineUp opacity-0 min-h-sc" style="--delay: 0.55s;" data-astro-cid-77sagjxz>
Here are some of the public solutions I have made.
</p></div></div></div><div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 justify-center justify-items-center" data-astro-cid-77sagjxz>${renderComponent($$result, "PortfolioCard", $$PortfolioCard, { "image": watersMassageLogo, "hrefUrl": "https://watersmassage.com/", "title": "Waters Massage Therapy", "message": "Provides personalized traveling massage therapy with online booking. Built with Astro and React.", "data-astro-cid-77sagjxz": true })}${renderComponent($$result, "PortfolioCard", $$PortfolioCard, { "image": BlackWiddowTattooLogo, "hrefUrl": "https://blackwiddowtattoo.ink/", "title": "Black Willow Tattoo", "message": "A local tattoo artist's business/portfolio website. Built with Astro.", "data-astro-cid-77sagjxz": true })}</div></div></div></div>`;
}, "D:/Projects/portfolio/src/components/smallparts/StaryPortfolio.astro", void 0);

const $$Astro = createAstro("https://johncwaters.com");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "DefaultPage", $$DefaultPage, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "IndexHero", $$IndexHero, {})}${renderComponent($$result2, "StaryPortfolio", $$StaryPortfolio, {})}` })}`;
}, "D:/Projects/portfolio/src/pages/index.astro", void 0);

const $$file = "D:/Projects/portfolio/src/pages/index.astro";
const $$url = "";

export { $$Index as default, $$file as file, $$url as url };
