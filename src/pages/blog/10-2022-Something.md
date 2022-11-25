---
layout: "../../layouts/BlogPost.astro"
title: "Functionality VS Looking Pretty - October 2022"
description: "From what I can tell, a lot of Frontend Developers care more about how good their site looks than how easy it is to use or understand. While both are important, not enough time is spent thinking/researching how users will actually use their product."
publishDate: "Oct 17 2022"
heroImage: "/assets/placeholder-hero.jpg"
updatedDate:
readTime: "9 mins"
tags: "NEW, DESIGN"
---

**TLDR:** I'm sick of 'bad' websites and have decided to make it my primary focus to make sure anything I build not only looks good, but is functional and easy to use/understand.

## What is a bad website?

A bad website fails on multiple levels: it needs to look good, be resposive, and easily accomplish whatever task/goal the user has for visiting it in the first place. This includes apps too.

Large, succesful, companies have bad websites.

Most feel like someone walked into the developer department, listed out 20 features that HAD to be included on a page, and then told them it was due tomorrow. Also, when they were done they could never touch the code again. The result is a bloated website and barely functional controls with a logo and color scheme slapped onto it.

WHY?

I get that custom building a website, especially one potentially serving thousands of people at a time, is expensive. 

## Okay, but what about maps?

My most recent project at work gave me an opportunity to build a custom Dashboard displaying utility maps with some filters. I used Astro as a framework, ESRI Javascript SDK for the managing the map, and their Calcite Design System for UI components.

Loading the map up is made easy with the SDK.

```js
const map = new Map({
  basemap: "arcgis-topographic", // Basemap layer service
});
```

The main challenge was adding unique filters and keeping the whole system modular in order to support future Dashboards without having to rewrite everything. Our goals were:

1. Display a map that could be used on desktop or mobile devices
2. Use ESRI tools as much as possible, avoiding too much custom HTML and CSS
3. Keep it modular so future dashboards can be easily added, even if it's by someone else

#### Mobile and Desktop Display

Usually making a website compatible with many screensizes requires a bit of work. Typically I use Tailwind CSS media queries to quick make elements responsive, but that wasn't an option.

Luckily I was pretty spoiled in this case and had little to no work to do since the ESRI SDK handled everything for me. Just create the component, stick it on the screen, it handles the rest.

```js
// Adding a layerList expand widget
layerList = new LayerList({
  container: document.createElement("div"),
  view: view,
});

layerListExpand = new Expand({
  view: view,
  content: layerList,
});

view.ui.add(layerListExpand, "top-right");
```

![A GIF example of a ESRI map resizing and adjusting the UI accordingly](/blog/ezri-resize-example.gif)

Anytime the screen size changed, the map and widgets simply adjusted themselves. Job done.

#### Using ESRI Tools Only

ESRI provides everything needed to display their maps.

The map is handled by the Javascript SDK. You initialize a new map and add Feature Layers to build it up (which are basically layers of information). One layer could be for water pipes while another is a layer for gas pipe.

You don't create the map in the frontend, you just call the respective API and slap it on the map.

```js
// Call the feature layer and save to an object
const featureLayer = new FeatureLayer({
  url: `https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis
    /rest/services/Landscape_Trees/FeatureServer/0`,
});

// Slap it on the map
map.add(featureLayer);
```

Now you have some data on top of your map!

![An image of a map with a new layer on it, showing tree density as circles](/blog/esri-example-photo.jpg)

You can add as many layers as needed, just keeping in mind that each one is an API call, and the bigger the feature layer the longer the load times.

#### Modular Growth

To make sure it was as easy as possible to create new Dashboards in the future, I used Astro's components and pages to build each map programatically.

The 'autoMap.astro' component holds all the logic needed to create the map which accepts a variety of properties and builds each thing on the fly. Almost everything done through the JS SDK is with API, so it's mostly passing in URL's and settings.

For example adding layers is as simple as adding Feature Layer URLS hosted ArcGIS Online to an object:

```js
const urlsList = {
  My_First_Nap:
    "https://arcgis.com/arcgis/rest/services/my_first_map/FeatureServer",
  My_Second_Map:
    "https://arcgis.com/arcgis/rest/services/my_second_map/FeatureServer",
};
```

Then a function I created would build off those properties to programatically add each layer to the page. For example, loading multiple layers onto the map without hardcoding each one into the page.

**Note:** Feature Layers have multiple layers themselves, so each one needs added.

```js
//set options for getting feature layer layers
var options = { query: { f: "json" }, responseType: "json" };

//get layers for each feature layer provided in 'urls' and add to map
async function getUrls(
  urls: { [x: string]: string },
  searchSettings: { [x: string]: __esri.SearchSource[] }
) {
  for (let u in urls) {
    // Request list of layers from hosted feature layer
    await esriRequest(urls[u] + "?token=" + esriToken, options)
      .then(function (response) {
        var data = response.data.layers;
        return data;
      })
      .then(
        function (data) {
          for (let i = 0; i < data.length; i++) {
            //creates a layer
            var layer = new FeatureLayer({
              url: urls[u] + "/" + data[i].id,
              id: data[i].name,
              title: data[i].name,
            });
            //push layer to map
            map.layers.push(layer);
          }
        },
        (error) => {
          /*handle errors*/
        }
      );
  }
}
```

**_Never hardcode layers into your map._** The Feature Layer URL will never change, but the layers inside are based on whatever work is done in the backend (like with ArcGIS Pro) so they can and will change, causing everything to break.

## Closing

Creating unique frontend UI is a lot of fun, but it's also nice to be able to throw something together really quickly using well made components. ESRI made it easy for me to create a quick proof of concept showing this solution would work for our business.

I hope you learned something!

John C. Waters
