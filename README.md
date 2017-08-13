# Instafeed
Instafeed is an easy-to-use JavaScript library to add photos and more from your Instagram news feed to your website.

This is a continuation and a remake of [Steven Schobert's original instafeed.js](https://github.com/stevenschobert/instafeed.js) in order to provide a full support of the latest Instagram API changes.

## Installation
Just download the script and include it into your HTML:
```html
<script src="path/to/instafeed.js"></script>
```

### AMD/CommonJS
Instafeed also supports AMD and CommonJS:
```javascript
// AMD
require(["path/to/instafeed"], function(Instafeed) {

});

//CommonJS
var Instafeed = require("instafeed");
```

### NPM
Instafeed is available on NPM:
```sh
$ npm install instafeed
```

## Requirements
The only thing you will need is a valid access token from Instagram's API with a suitable access scope for your needs.
Learn more about [Login Permissions (Scopes)](https://www.instagram.com/developer/authorization/).

To get one, you can use the Instagram application [blackCICADA Access Token](https://www.blackcicada.com/apps/instagram/blackcicada_access_token/). It provides an access scope of `basic`.

## Basic Usage
```javascript
var instafeed = new Instafeed({
    accessToken: "ACCESS_TOKEN"
});

instafeed.run();
```

Instafeed will automatically search for an element with `id="instafeed"` and fill it with thumbnails all of your last feeds. You can change this behavior using [Standard Options](#standard-options). Also check out the [Advanced Options](#advanced-options) for some advanced ways of customizing Instafeed.

Keep in mind, Instafeed can only fetch content from your news feed that you can see.

## Standard Options
* `accessToken` (string) -  __Required.__ A valid access token from Instagram's API.
* `get` (string) - Customize what Instafeed fetches:
    * `"user"` - __Default.__ Content from a specific user. __Requires access scope `basic` if `userId` is `"self"` or the own ID, otherwise `public_content`.__
    * `"tag"` -  Content with a specific tag. __Requires `tagName` and an access scope of `public_content`.__
    * `"location"` -  Content from a specific location. __Requires `locationId` and an access scope of `public_content`.__
* `userId` (number) -  __Default is `"self"`.__ Unique ID of a user to get content from. __Use with `get: "user"`.__
* `tagName` (string) -  Name of the tag to get content from. __Use with `get: "tag"`.__
* `locationId` (number) -  Unique ID of a location to get content from. __Use with `get: "location"`.__
* `limit` (number) -  __Default is `0` (maximum).__ Maximum number of content to add. The maximum is limited by Instagram.
* `sortBy` (string) - Sort the content in a set order:
    * `"none"` - __Default.__ As they come from Instagram.
    * `"most-recent"` -  Newest to oldest.
    * `"least-recent"` -  Oldest to newest.
    * `"most-liked"` -  Highest number of likes to lowest.
    * `"least-liked"` -  Lowest number of likes to highest.
    * `"most-commented"` -  Highest number of comments to lowest.
    * `"least-commented"` -  Lowest number of comments to highest.
    * `"random"` -  Random order.
* `imageTemplate` (string) - __Default is `"<img src="{{source}}" width="{{width}}" height="{{height}}">"`.__ Custom HTML template to use with images. See [Templating](#templating).
* `videoTemplate` (string) - __Default is `"<img src="{{previewSource}}" width="{{previewWidth}}" height="{{previewHeight}}">"`.__ Custom HTML template to use with videos. See [Templating](#templating).
* `carouselFrameTemplate` (string) - __Default is `"<img src="{{previewSource}}" width="{{previewWidth}}" height="{{previewHeight}}">"`.__ Custom HTML template to use with carousels. See [Templating](#templating).
* `carouselImageTemplate` (string) - __Default is `""`.__ Custom HTML template to use with images within carousels. See [Templating](#templating).
* `carouselVideoTemplate` (string) - __Default is `""`.__ Custom HTML template to use with videos within carousels. See [Templating](#templating).
* `imageResolution` (string) - Size of the images to get:
    * `"thumbnail"` - __Default.__ 150px x 150px.
    * `"low_resolution"` - 320px x 320px (varies in size).
    * `"standard_resolution"` - 640px x 640px (varies in size).
* `videoResolution` (string) - Size of the videos to get:
    * `"standard_resolution"` - __Default.__ 480px x 480px.
    * `"low_bandwidth"` - 480px x 480px (varies in size).
    * `"low_resolution"` - 480px x 480px (varies in size).
* `relativeScheme` (boolean) - __Default is `false`.__ Set to `true` to use protocol-relative URL schemes for the external content.
* `target` (string) - __Default is `"instafeed"`.__ Either the ID name or the DOM element itself where you want to add the content to.

## Advanced Options
* `mock` (boolean) -  __Default is `false`.__ Set to `true` to fetch data without inserting content into DOM. __Use with  `success`.__
* `filter` (function) - A function used to filter the content. It will be given the current JSON object as an argument. To filter out content, the function has to return `false`, otherwise `true`.
* `onBefore` (function) -  A callback function called before content is added to the target.
* `onAfter` (function) -  A callback function called after content has been added to the target.
* `onSuccess` (function) -  A callback function called when everything is done without an error. It will be given the response from Instagram as JSON object as an argument.
* `onError` (function) - A callback function called when an error occurred. It will be given a string describing the error as an argument.

For example, how to get the user's content tagged with `awesome`:

```javascript
var instafeed = new Instafeed({
    accessToken: "ACCESS_TOKEN",

    filter: function(data) {
        return data.tags.find(function(tag) {
            return tag === "awesome";
        });
    },

    onSuccess: function() {
        alert("Success!");
    },

    onError: function(message) {
        alert(message);
    }
});

instafeed.run();
```

## Templating
To control the way Instafeed looks is to use the template option. You can write your own HTML markup and it will be used for everything that Instafeed fetches. For example, you can link every image to the original content on Instagram:

```javascript
var instafeed = new Instafeed({
    accessToken: "ACCESS_TOKEN",
    get: "tag",
    tagName: "awesome",
    imageTemplate: "<a class=\"instagram\" href=\"{{link}}\"><img src=\"{{source}}\"></a>"
});

instafeed.run();
```

The templating option provides several tags for you to use to control where variables are inserted into your HTML markup.

### Image Templating
Available tags for `imageTemplate` are:
* `{{id}}` - Unique ID of the image.
* `{{type}}` - Type of the content. __Can be `"image"`, `"video"`, or `"carousel"` (here `"image"`).__
* `{{userId}}` - Unique ID of the user.
* `{{fullName}}` - Full name of the user.
* `{{profilePicture}}` - The URL to the profile picture of the user (150px x 150px).
* `{{username}}` - The user's username on Instagram.
* `{{caption}}` - Caption text of the image. __Default is `""` if there is none.__
* `{{source}}` - URL to the source of the image on Instagram.
* `{{width}}` - Width of the image in pixels.
* `{{height}}` - Height of the image in pixels.
* `{{orientation}}` - Orientation of the image. __Can be `"square"`, `"portrait"` or `"landscape"`.__
* `{{userLiked}}` - Defines whether the user has liked this image or not. __Can be `"true"` or `"false"`.__
* `{{likes}}` - Number of likes the image has.
* `{{comments}}` - Number of comments the image has.
* `{{location}}` - Name of the location associated with the image. __Default is `""` if there is none.__
* `{{time}}` - The creation time of the image as Unix Timestamp.
* `{{link}}` - The URL to the normal view of the image on Instagram.
* `{{model}}` - Full JSON object of the image content. If you want to get a property of the content that is not listed above, you can access it using dot-notation.

### Video Templating
For `videoTemplate` are the following tags available:
* `{{id}}` - Unique ID of the video.
* `{{type}}` - Type of the content. __Can be `"image"`, `"video"`, or `"carousel"` (here `"video"`).__
* `{{userId}}` - Unique ID of the user.
* `{{fullName}}` - Full name of the user.
* `{{profilePicture}}` - The URL to the profile picture of the user (150px x 150px).
* `{{username}}` - The user's username on Instagram.
* `{{caption}}` - Caption text of the video. __Default is `""` if there is none.__
* `{{previewSource}}` - URL to the source of the preview image on Instagram.
* `{{previewWidth}}` - Width of the preview image in pixels.
* `{{previewHeight}}` - Height of the preview image in pixels.
* `{{previewOrientation}}` - Orientation of the preview image. __Can be `"square"`, `"portrait"` or `"landscape"`.__
* `{{source}}` - URL to the source of the video on Instagram.
* `{{width}}` - Width of the video in pixels.
* `{{height}}` - Height of the video in pixels.
* `{{orientation}}` - Orientation of the video. __Can be `"square"`, `"portrait"` or `"landscape"`.__
* `{{userLiked}}` - Defines whether the user has liked this video or not. __Can be `"true"` or `"false"`.__
* `{{likes}}` - Number of likes the video has.
* `{{comments}}` - Number of comments the video has.
* `{{location}}` - Name of the location associated with the video. __Default is `""` if there is none.__
* `{{time}}` - The creation time of the video as Unix Timestamp.
* `{{link}}` - The URL to the normal view of the video on Instagram.
* `{{model}}` - Full JSON object of the video content. If you want to get a property of the content that is not listed above, you can access it using dot-notation.

### Carousel Templating
Within carousels there are separated templates for images with `carouselImageTemplate` and videos with `carouselVideoTemplate`. Only the following tags are available:
* `{{type}}` - Type of the content. __Can be `"image"` or `"video"`.__
* `{{source}}` - URL to the source of the content on Instagram.
* `{{width}}` - Width of the content in pixels.
* `{{height}}` - Height of the content in pixels.
* `{{orientation}}` - Orientation of the content. __Can be `"square"`, `"portrait"` or `"landscape"`.__

To bundle these images and videos you can create a frame with `carouselFrameTemplate` and these tags:
* `{{id}}` - Unique ID of the carousel.
* `{{type}}` - Type of the content. __Can be `"image"`, `"video"`, or `"carousel"` (here `"carousel"`).__
* `{{userId}}` - Unique ID of the user.
* `{{fullName}}` - Full name of the user.
* `{{profilePicture}}` - The URL to the profile picture of the user (150px x 150px).
* `{{username}}` - The user's username on Instagram.
* `{{caption}}` - Caption text of the carousel. __Default is `""` if there is none.__
* `{{previewSource}}` - URL to the source of the preview image on Instagram.
* `{{previewWidth}}` - Width of the preview image in pixels.
* `{{previewHeight}}` - Height of the preview image in pixels.
* `{{previewOrientation}}` - Orientation of the preview image. __Can be `"square"`, `"portrait"` or `"landscape"`.__
* `{{userLiked}}` - Defines whether the user has liked this content or not. __Can be `"true"` or `"false"`.__
* `{{likes}}` - Number of likes the carousel has.
* `{{comments}}` - Number of comments the carousel has.
* `{{location}}` - Name of the location associated with the carousel. __Default is `""` if there is none.__
* `{{time}}` - The creation time of the carousel as Unix Timestamp.
* `{{link}}` - The URL to the normal view of the carousel on Instagram.
* `{{model}}` - Full JSON object of the carousel content. If you want to get a property of the content that is not listed above, you can access it using dot-notation.
* __`{{carousel}}` - Every image and video will be parsed using the corresponding templating option and inserted at this tag.__

## Pagination
Instafeed has a `next` method you can call to load more content from Instagram. Under the hood, this uses the pagination data from the Instagram API. Additionally, there is a helper method called `hasNext` that you can use to check if pagination data is available.

Together these options can be used to create a *Load More* button:
```javascript
var loadMoreButton = document.getElementById("loadMoreButton");

var instafeed = new Instafeed({
    accessToken: "ACCESS_TOKEN",

    onSuccess: function() {
        if(!this.hasNext()) loadMoreButton.disabled = true;
    }
});

loadMoreButton.addEventListener("click", function() {
    instafeed.next();
});

instafeed.run();
```

The `hasNext` method only returns reliable data after every `onSuccess` callback. Until that it will return always `false`.
