/*
Copyright 2017 blackCICADA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

;(function() {
    "use strict";

    function Instafeed(options) {
        this.uuid = "instafeed".concat(uuidv4().replace(/-/g, ""));
        if(!options) throw new Error("InstafeedOptionsError: Missing options.");
        this.url = "https://api.instagram.com/v1/";

        switch(options.get) {
            case "tag":
                if(typeof options.tagName !== "string") throw new Error("InstafeedOptionsError: Missing or invalid option \"tagName\".");
                this.url = this.url.concat("tags/", encodeURIComponent(options.tagName));
                break;

            case "location":
                if(typeof options.locationId !== "number") throw new Error("InstafeedOptionsError: Missing or invalid option \"locationId\".");
                this.url = this.url.concat("locations/", options.locationId.toString());
                break;

            default:
                if(typeof options.get !== "undefined" && options.get !== "user") throw new Error("InstafeedOptionsError: Invalid option \"get\".");
                this.url = this.url.concat("users/");

                switch(typeof options.userId) {
                    case "undefined":
                        this.url = this.url.concat("self");
                        break;

                    case "number":
                        this.url = this.url.concat(options.userId.toString());
                        break;

                    default:
                        throw new Error("InstafeedOptionsError: Invalid option \"userId\".");
                }
        }

        if(typeof options.accessToken !== "string") throw new Error("InstafeedOptionsError: Missing or invalid option \"accessToken\".");
        this.url = this.url.concat("/media/recent?access_token=", encodeURIComponent(options.accessToken), "&callback=", this.uuid, ".parse");
        this.nextUrl = "";

        if(typeof options.limit !== "undefined") {
            if(typeof options.limit !== "number") throw new Error("InstafeedOptionsError: Invalid option \"limit\".");
            if(options.limit) this.url = this.url.concat("&count=", options.limit.toString());
        }

        if(typeof options.sort === "undefined") {
            this.sort = "none";
        } else {
            if(!/^(?:none|(?:most|least)-(?:recent|liked|commented)|random)$/.test(options.sort)) throw new Error("InstafeedOptionsError: Invalid option \"sort\".");
            this.sort = options.sort;
        }

        if(typeof options.imageTemplate === "undefined") {
            this.imageTemplate = "<img src=\"{{source}}\" width=\"{{width}}\" height=\"{{height}}\">";
        } else {
            if(typeof options.imageTemplate !== "string") throw new Error("InstafeedOptionsError: Invalid option \"imageTemplate\".");
            this.imageTemplate = options.imageTemplate;
        }

        if(typeof options.videoTemplate === "undefined") {
            this.videoTemplate = "<img src=\"{{previewSource}}\" width=\"{{previewWidth}}\" height=\"{{previewHeight}}\">";
        } else {
            if(typeof options.videoTemplate !== "string") throw new Error("InstafeedOptionsError: Invalid option \"videoTemplate\".");
            this.videoTemplate = options.videoTemplate;
        }

        if(typeof options.carouselFrameTemplate === "undefined") {
            this.carouselFrameTemplate = "<img src=\"{{previewSource}}\" width=\"{{previewWidth}}\" height=\"{{previewHeight}}\">";
        } else {
            if(typeof options.carouselFrameTemplate !== "string") throw new Error("InstafeedOptionsError: Invalid option \"carouselFrameTemplate\".");
            this.carouselFrameTemplate = options.carouselFrameTemplate;
        }

        if(typeof options.carouselImageTemplate === "undefined") {
            this.carouselImageTemplate = "";
        } else {
            if(typeof options.carouselImageTemplate !== "string") throw new Error("InstafeedOptionsError: Invalid option \"carouselImageTemplate\".");
            this.carouselImageTemplate = options.carouselImageTemplate;
        }

        if(typeof options.carouselVideoTemplate === "undefined") {
            this.carouselVideoTemplate = "";
        } else {
            if(typeof options.carouselVideoTemplate !== "string") throw new Error("InstafeedOptionsError: Invalid option \"carouselVideoTemplate\".");
            this.carouselVideoTemplate = options.carouselVideoTemplate;
        }

        if(typeof options.imageResolution === "undefined") {
            this.imageResolution = "thumbnail";
        } else {
            if(!/^(?:thumbnail|low_resolution|standard_resolution)$/.test(options.imageResolution)) throw new Error("InstafeedOptionsError: Invalid option \"imageResolution\".");
            this.imageResolution = options.imageResolution;
        }

        if(typeof options.videoResolution === "undefined") {
            this.videoResolution = "standard_resolution";
        } else {
            if(!/^(?:standard_resolution|low_bandwidth|low_resolution)$/.test(options.videoResolution)) throw new Error("InstafeedOptionsError: Invalid option \"videoResolution\".");
            this.videoResolution = options.videoResolution;
        }

        if(typeof options.relativeScheme === "undefined") {
            this.relativeScheme = false;
        } else {
            if(typeof options.relativeScheme !== "boolean") throw new Error("InstafeedOptionsError: Invalid option \"relativeScheme\".");
            this.relativeScheme = options.relativeScheme;
        }

        if(typeof options.target === "undefined") {
            this.target = "instafeed";
        } else {
            if(typeof options.target !== "string") throw new Error("InstafeedOptionsError: Invalid option \"target\".");
            this.target = options.target;
        }

        if(typeof options.mock === "undefined") {
            this.mock = false;
        } else {
            if(typeof options.mock !== "boolean") throw new Error("InstafeedOptionsError: Invalid option \"mock\".");
            this.mock = options.mock;
        }

        this.filter = typeof options.filter === "function" ? options.filter : null;
        this.onBefore = typeof options.onBefore === "function" ? options.onBefore : null;
        this.onAfter = typeof options.onAfter === "function" ? options.onAfter : null;
        this.onSuccess = typeof options.onSuccess === "function" ? options.onSuccess : null;
        this.onError = typeof options.onError === "function" ? options.onError : null;
    }

    Instafeed.prototype.run = function(nextUrl) {
        if(typeof window === "undefined" || !window) throw new Error("InstafeedRunError: No window object available.");
        window[this.uuid] = {};
        window[this.uuid].parse = parse.bind(this);
        if(typeof document === "undefined" || !document) throw new Error("InstafeedRunError: No document object available.");
        var script = document.createElement("script");
        script.id = this.uuid;
        script.src = nextUrl || this.url;

        script.onerror = function() {
            document.head.removeChild(document.getElementById(this.uuid));
            this.onError("InstafeedConnectionError: Connection to Instagram failed.");
        }.bind(this);

        document.head.appendChild(script);
    };

    Instafeed.prototype.hasNext = function() {
        return this.nextUrl.length > 0;
    };

    Instafeed.prototype.next = function() {
        if(this.hasNext()) {
            this.run(this.nextUrl);
            this.nextUrl = "";
        }
    };

    function uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/x/g, function() {
            return (Math.random() * 16 | 0).toString(16);
        }).replace("y", ((Math.random() * 16 | 0) & 0x3 | 0x8).toString(16));
    }

    function parse(response) {
        document.head.removeChild(document.getElementById(this.uuid));
        delete window[this.uuid];

        try {
            if(!response || !response.meta || typeof response.meta.code !== "number") throw new Error();
            if(response.meta.code !== 200) throw new Error(typeof response.meta.error_type === "string" && typeof response.meta.error_message === "string" ? "InstafeedInstagramAPIError: \"".concat(response.meta.error_type, ": ", response.meta.error_message, "\".") : "InstafeedConnectionError: Connection to Instagram failed.");

            if(!this.mock) {
                if(!response.data) throw new Error();

                if(this.sort === "random") {
                    for(var i = response.data.length - 1; i; i--) {
                        var randomIndex = Math.floor(Math.random() * (i + 1));
                        var randomValue = response.data[i];
                        response.data[i] = response.data[randomIndex];
                        response.data[randomIndex] = randomValue;
                    }
                } else if(this.sort !== "none") {
                    var sortArray = this.sort.split("-");
                    var reverse = sortArray[0] === "least";
                    var property;

                    switch(sortArray[1]) {
                        case "recent":
                            property = "created_time";
                            break;

                        case "liked":
                            property = "likes.count";
                            break;

                        case "commented":
                            property = "comments.count";
                            break;
                    }

                    response.data.sort(function(a, b) {
                        var valueA = getObjectProperty(a, property);
                        var valueB = getObjectProperty(b, property);
                        if(valueA === null || valueB === null) throw new Error();
                        return valueA < valueB ^ reverse ? 1 : -1;
                    });
                }

                if(this.filter) {
                    response.data.forEach(function(data, i) {
                        if(!this.filter(data)) delete response.data[i];
                    }, this);
                }

                var div = document.createElement("div");

                response.data.forEach(function(data) {
                    if(typeof data.id !== "string" || typeof data.type !== "string" || !data.images || !data.user || typeof data.user.id !== "string" || typeof data.user.full_name !== "string" || typeof data.user.profile_picture !== "string" || typeof data.user.username !== "string" || typeof data.user_has_liked !== "boolean" || !data.likes || typeof data.likes.count !== "number" || !data.comments || typeof data.comments.count !== "number" || typeof data.created_time !== "string" || typeof data.link !== "string") throw new Error();

                    var templateValues = {
                        id: data.id,
                        type: data.type,
                        userId: data.user.id,
                        fullName: data.user.full_name,
                        profilePicture: data.user.profile_picture,
                        username: data.user.username,
                        caption: data.caption && typeof data.caption.text === "string" ? data.caption.text : "",
                        userLiked: data.user_has_liked ? "true" : "false",
                        likes: data.likes.count,
                        comments: data.comments.count,
                        location: data.location && typeof data.location.name === "string" ? data.location.name : "",
                        time: data.created_time,
                        link: data.link,
                        model: data
                    };

                    var preview = data.images[this.imageResolution];
                    if(!preview || typeof preview.url !== "string" || typeof preview.width !== "number" || typeof preview.height !== "number") throw new Error();
                    var previewSource = this.relativeScheme ? preview.url.replace(/^https?:/, "") : preview.url;
                    var previewOrientation = preview.width === preview.height ? "square" : (preview.width > preview.height ? "landscape" : "portrait");

                    switch(data.type) {
                        case "image":
                            templateValues.source = previewSource;
                            templateValues.width = preview.width;
                            templateValues.height = preview.height;
                            templateValues.orientation = previewOrientation;
                            div.innerHTML = div.innerHTML.concat(parseTemplate(this.imageTemplate, templateValues));
                            break;

                        case "video":
                            templateValues.previewSource = previewSource;
                            templateValues.previewWidth = preview.width;
                            templateValues.previewHeight = preview.height;
                            templateValues.previewOrientation = previewOrientation;
                            if(!data.videos) throw new Error();
                            var video = data.videos[this.videoResolution];
                            if(!video || typeof video.url !== "string" || typeof video.width !== "number" || typeof video.height !== "number") throw new Error();
                            templateValues.source = this.relativeScheme ? video.url.replace(/^https?:/, "") : video.url;
                            templateValues.width = video.width;
                            templateValues.height = video.height;
                            templateValues.orientation = video.width === video.height ? "square" : (video.width > video.height ? "landscape" : "portrait");
                            div.innerHTML = div.innerHTML.concat(parseTemplate(this.videoTemplate, templateValues));
                            break;

                        case "carousel":
                            templateValues.previewSource = previewSource;
                            templateValues.previewWidth = preview.width;
                            templateValues.previewHeight = preview.height;
                            templateValues.previewOrientation = previewOrientation;
                            templateValues.carousel = ""
                            if(!data.carousel_media) throw new Error();

                            data.carousel_media.forEach(function(media) {
                                if(typeof media.type !== "string") throw new Error();

                                var templateCarouselValues = {
                                    type: media.type
                                };

                                switch(media.type) {
                                    case "image":
                                        if(!data.images) throw new Error();
                                        var image = media.images[this.imageResolution];
                                        if(!image || typeof image.url !== "string" || typeof image.width !== "number" || typeof image.height !== "number") throw new Error();
                                        templateCarouselValues.source = this.relativeScheme ? image.url.replace(/^https?:/, "") : image.url;
                                        templateCarouselValues.width = image.width;
                                        templateCarouselValues.height = image.height;
                                        templateCarouselValues.orientation = image.width === image.height ? "square" : (image.width > image.height ? "landscape" : "portrait");
                                        templateValues.carousel = templateValues.carousel.concat(parseTemplate(this.carouselImageTemplate, templateCarouselValues));
                                        break;

                                    case "video":
                                        if(!data.videos) throw new Error();
                                        var video = media.videos[this.videoResolution];
                                        if(!video || typeof video.url !== "string" || typeof video.width !== "number" || typeof video.height !== "number") throw new Error();
                                        templateCarouselValues.source = this.relativeScheme ? video.url.replace(/^https?:/, "") : video.url;
                                        templateCarouselValues.width = video.width;
                                        templateCarouselValues.height = video.height;
                                        templateCarouselValues.orientation = video.width === video.height ? "square" : (video.width > video.height ? "landscape" : "portrait");
                                        templateValues.carousel = templateValues.carousel.concat(parseTemplate(this.carouselVideoTemplate, templateCarouselValues));
                                        break;
                                }
                            }, this);

                            div.innerHTML = div.innerHTML.concat(parseTemplate(this.carouselFrameTemplate, templateValues));
                            break;
                    }
                }, this);

                if(this.onBefore) this.onBefore();
                var targetElement = document.getElementById(this.target);
                if(!targetElement) throw new Error("InstafeedParseError: No target element found.");
                for(var i = div.childNodes.length; i; i--) targetElement.appendChild(div.childNodes[0]);
                if(this.onAfter) this.onAfter();
            }

            if(response.pagination && typeof response.pagination.next_url === "string") this.nextUrl = response.pagination.next_url;
            if(this.onSuccess) this.onSuccess(response);
        } catch(e) {
            if(this.onError) this.onError(e.message.length ? e.message : "InstafeedParseError: Invalid response from Instagram.");
        }
    }

    function getObjectProperty(object, property) {
        var pieces = property.replace(/\[(\w+)\]/g, ".$1").split(".");

        while(pieces.length) {
            var piece = pieces.shift();
            if(object == null || !(piece in object)) return null;
            object = object[piece];
        }

        return object;
    }

    function parseTemplate(template, values) {
        var pattern = /(?:\{{2})(\w+(?:\.\w+|\[\w+\])*)(?:\}{2})/;

        while(pattern.test(template)) {
            var key = template.match(pattern)[1];
            var value = getObjectProperty(values, key);
            if(value === null) value = "";

            template = template.replace(pattern, function() {
                return value;
            });
        }

        return template;
    }

    (function(root, factory) {
        if(typeof define === "function" && typeof define.amd === "object" && define.amd) {
            define(factory);
        } else if(typeof module === "object" && module.exports) {
            module.exports = factory();
        } else {
            root.Instafeed = factory();
        }
    })(this, function() {
        return Instafeed;
    });
}.call(this));
