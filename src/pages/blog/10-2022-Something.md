---
layout: "../../layouts/BlogPost.astro"
title: "Something - October 2022"
description: "Creating digital maps is a lot more complicated than I thought, especially when you factor in how much information it has to hold while still being coherent. While I don't have to worry about creating the map too much, displaying it effectively and quickly is still a challenge."
publishDate: "Oct 17 2022"
heroImage: "/assets/placeholder-hero.jpg"
updatedDate:
readTime: "9 mins"
tags: "NEW, ESRI"
---

**TLDR:** I used ESRI tools and Astro to build a modular custom Dashboard for viewing utility maps. The main challenges were keeping the tools to just ESRI (for simplicity) and keeping it modular so we could add more quickly. While the methods I describe are probably not 'the best way', it's what I came up with in a short amount of time.

## Maps, maps, maps...

I work at ELM Companies, specifically their utility locating branch that specializes in... well utility locating. You call 811 before you dig and they probably call us (if you live on the west coast).

That's pretty simple. It gets complicated when you realize that each state has several utilities each with several utility companies responsibile for them.

> The number of electric utility companies operating in the United States is estimated at over 3,300, with around 200 of them providing power to the majority of users. The U.S. power grid connects about 2.5 million miles of feeder lines and over 450,000 miles of high-voltage transmission lines.<br>
> — <cite>Statista[^1]</cite>

[^1]: The above quote is excerpted from a report on [statista](https://www.statista.com/statistics/237773/the-largest-electric-utilities-in-the-us-based-on-market-value/#:~:text=The%20number%20of%20electric%20utility,of%20high%2Dvoltage%20transmission%20lines.), September 2022.

That's just the electric companies! Gas, water, anything that runs through a pipe has to be carefully tracked and managed to ensure reliability.

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
