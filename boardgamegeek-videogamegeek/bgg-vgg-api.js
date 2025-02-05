app.classes.api.bgg = class {
    constructor() {
        this.boardGameClass = app.classes.api.bgg.boardGame;
        this.videoGameClass = app.classes.api.bgg.videoGame;
        this.baseURL = "https://boardgamegeek.com/xmlapi2";
    }

    getXMLFromEndpoint(endpointURL, params = {}) {
        let fullURL = this.baseURL + endpointURL;
        let queryParts = [];
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                queryParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        }
        if (queryParts.length > 0) {
            fullURL += '?' + queryParts.join('&');
        }

        let request = app.request(fullURL);
        let response = request.send();

        return response.statusCode === 200 ? response.xml() : null;
    }

    searchThings(query, types, exact = 1) {
        let queryText = query.isText() ? query.value : "";
        let searchResults = [];

        let data = this.getXMLFromEndpoint("/search", {
            query: queryText,
            type: types,
            exact: exact
        });

        if (data) {
            let items = data.find("/items/item");
            if (items && items.length > 0) {
                for (let item of items) {
                    let thing = new app.classes.api.bgg.thingResult(item, exact);
                    let searchResult = app.searchResult.new();
                    searchResult.title = thing.name;
                    searchResult.subtitle = thing.year;
                    searchResult.imageURL = thing.thumbnail;
                    searchResult.params = {
                        id: thing.id
                    };
                    searchResults.push(searchResult);
                }
            }
        }

        return searchResults;
    }

    getThing(id, type = undefined, search = 0) {
        let data = this.getXMLFromEndpoint("/thing", { id: id });

        if (data) {
            let item = data.find("/items/item")[0];
            if (item) {
                if (search) {
                    return item;
                }
                if (type === "board-game") {
                    return new this.boardGameClass(item);
                } else if (type === "video-game") {
                    return new this.videoGameClass(item);
                }
            }
        }

        return undefined;
    }

    decodeXMLEncodings(rawString) {
        const xmlMap = {
            // quotation marks
            '&quot;': '"',
            '&apos;': "'",
            // other common special characters
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&mdash;': '—',
            '&ndash;': '–',
            // German extended latin characters
            '&szlig;': 'ß',
            '&auml;': 'ä', '&Auml;': 'Ä',
            '&#195;&#164;': 'ä', '&#195;&#132;': 'Ä',
            '&ouml;': 'ö', '&Ouml;': 'Ö',
            '&#195;&#182;': 'ö', '&#195;&#150;': 'Ö',
            '&uuml;': 'ü', '&Uuml;': 'Ü',
            '&#195;&#188;': 'ü', '&#195;&#156;': 'Ü',
            // Other western European extended latin characters
            '&aacute;': 'á', '&Aacute;': 'Á',
            '&eacute;': 'é', '&Eacute;': 'É',
            '&iacute;': 'í', '&Iacute;': 'Í',
            '&oacute;': 'ó', '&Oacute;': 'Ó',
            '&uacute;': 'ú', '&Uacute;': 'Ú',
            '&agrave;': 'à', '&Agrave;': 'À',
            '&egrave;': 'è', '&Egrave;': 'È',
            '&igrave;': 'ì', '&Igrave;': 'Ì',
            '&ograve;': 'ò', '&Ograve;': 'Ò',
            '&ugrave;': 'ù', '&Ugrave;': 'Ù',
            '&ntilde;': 'ñ', '&Ntilde;': 'Ñ',
            '&ccedil;': 'ç', '&Ccedil;': 'Ç'
        };

        // all upper case letters and quotation marks are assumed to be missing a preceding space if there is not already a space before or after them
        const addPrecedingSpaceIfNoSpaces = new Set([
            '&quot;',
            '&Auml;', '&#195;&#132;',
            '&Ouml;', '&#195;&#150;',
            '&Uuml;', '&#195;&#156;',
            '&Aacute;', '&Eacute;', '&Iacute;', '&Oacute;', '&Uacute;',
            '&Agrave;', '&Egrave;', '&Igrave;', '&Ograve;', '&Ugrave;',
            '&Ntilde;', '&Ccedil;'
        ]);

        // most other special characters are assumed to always need a space before and after them
        const addSpaces = new Set([
            '&amp;', '&lt;', '&gt;', '&mdash;', '&ndash;',
        ]);

        // process each XML code once
        for (const code in xmlMap) {
            // add a preceding space if there is no space before or after the code, as preceding spaces get deleted during XML parsing, but trailing spaces do not
            // thus, if there is no trailing space, it means that (for this subset of characters) the preceding space got deleted
            if (addPrecedingSpaceIfNoSpaces.has(code)) {
                let regex;
                if (code === '&quot;') {
                    // exception: do not add a preceding space if the quotation mark is:
                    // - preceded by whitespace, "&#10;" (encoded newline), a dash (-), or an opening parenthesis ([, (, {)
                    // - followed by whitespace, "&#10;" (encoded newline), punctuation (. , : ; ! ? -), or a closing parenthesis (], ), })
                    regex = new RegExp(`(?<!(?:\\s|&#10;|-)|(?:[\\(\\[{]))${code}(?!(?:\\s|&#10;|[.,:;!?-])|(?:[\\)\\]}]))`, 'g');
                } else {
                    // Exception: do not add a preceding space if the character is:
                    // - preceded by whitespace, "&#10;" (encoded newline), a dash (-), a quotation mark (") (already decoded), or an opening parenthesis ([, (, {)
                    regex = new RegExp(`(?<!(?:\\s|&#10;|-)|(?:["\\(\\[{]))${code}(?!\\s)`, 'g');
                }
                rawString = rawString.replace(regex, ` ${code}`);
            // ensure both preceding and trailing spaces are present around this subset of codes
            } else if (addSpaces.has(code)) {
                let regexPre = new RegExp(`(?<!\\s)${code}`, 'g');
                rawString = rawString.replace(regexPre, ` ${code}`);
                let regexPost = new RegExp(`${code}(?!\\s)`, 'g');
                rawString = rawString.replace(regexPost, `${code} `);
            }
            // finally, replace the XML code with its corresponding character
            rawString = rawString.replace(new RegExp(code, 'g'), xmlMap[code]);
        }

        // replace line breaks and trim whitespace from start and end
        rawString = rawString.replace(/&#10;/g, "\n").trim();

        return rawString;
    }
}

//
// Search Result
//

app.classes.api.bgg.thingResult = class {
    constructor(data, exact) {
        this.data = data;
        this.exact = exact;
        // some entries like thumbnail URLs (always) and release year (only in the case of video games) are not provided by the search API
        // so we query the full details of these items to populate this information
        // however, this can only be done in exact matching mode as otherwise we will overwhelm the API with requests (non-exact searching can yield 100s or 1000s of results, exact searching usually <10)
        if (this.exact === 1) {
            this.details = app.api.bgg.getThing(this.id, undefined, 1)
        }
    }

    get id() {
        return this.data.getAttribute("id");
    }

    get name() {
        let nameNode = this.data.find("./name")[0];
        return nameNode ? nameNode.getAttribute("value") : "Unknown Title";
    }

    get year() {
        // board games
        let yearNode = this.data.find("./yearpublished")[0];
        if (yearNode) {
            return yearNode.getAttribute("value");
        }

        // video games (only in exact mode)
        let releaseDateNode = this.details?.find("./releasedate")[0];
        if (releaseDateNode) {
            let fullDate = releaseDateNode.getAttribute("value");
            return fullDate?.substring(0, 4);
        }

        // fallback
        return undefined;
    }

    get thumbnail() {
        // only in exact mode
        let thumbnailURLNode = this.details?.find("./thumbnail")[0];
        if (thumbnailURLNode) {
            return thumbnailURLNode.string()
        }

        // fallback (non-exact mode)
        return undefined;
    }
}

//
// Board Game
//

app.classes.api.bgg.boardGame = class {
    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.getAttribute("id");
    }

    get name() {
        let nameNode = this.data.find("./name")[0];
        return nameNode ? nameNode.getAttribute("value") : "Unknown Title";
    }

    get cover() {
        let imageURLNode = this.data.find("./image")[0];
        return imageURLNode ? app.image.fromURL(imageURLNode.string()) : undefined;
    }

    get year() {
        let yearNode = this.data.find("./yearpublished")[0];
        return yearNode ? Number(yearNode.getAttribute("value")) : undefined;
    }

    get players() {
        let minPlayersNode = this.data.find("./minplayers")[0];
        let minPlayers = minPlayersNode ? minPlayersNode.getAttribute("value") : undefined;
        if (minPlayers == "0") {
            minPlayers = undefined;
        }

        let maxPlayersNode = this.data.find("./maxplayers")[0];
        let maxPlayers = maxPlayersNode ? maxPlayersNode.getAttribute("value") : undefined;
        if (maxPlayers == "0") {
            maxPlayers = undefined;
        }

        if (minPlayers && maxPlayers && minPlayers === maxPlayers) {
            return minPlayers;
        }
        if (minPlayers && maxPlayers) {
            return `${minPlayers} - ${maxPlayers}`;
        }
        return minPlayers || maxPlayers;
    }

    get playtime() {
        let minPlaytimeNode = this.data.find("./minplaytime")[0];
        let minPlaytime = minPlaytimeNode ? minPlaytimeNode.getAttribute("value") : undefined;
        if (minPlaytime == "0") {
            minPlaytime = undefined;
        }

        let maxPlaytimeNode = this.data.find("./maxplaytime")[0];
        let maxPlaytime = maxPlaytimeNode ? maxPlaytimeNode.getAttribute("value") : undefined;
        if (maxPlaytime == "0") {
            maxPlaytime = undefined;
        }

        if (minPlaytime && maxPlaytime && minPlaytime === maxPlaytime) {
            return minPlaytime;
        }
        if (minPlaytime && maxPlaytime) {
            return `${minPlaytime} - ${maxPlaytime}`;
        }
        return minPlaytime || maxPlaytime;
    }

    get categories() {
        let documents = [];

        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "boardgamecategory") {
                    let document = app.document.builder();
                    document.setIdentifier("bgg-id");
                    document.setString(linkNode.getAttribute("id"), "bgg-id");
                    document.setString(linkNode.getAttribute("value"), "category");
                    documents.push(document);
                }
            }
        }

        return documents;
    }

    get mechanics() {
        let documents = [];

        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "boardgamemechanic") {
                    let document = app.document.builder();
                    document.setIdentifier("bgg-id");
                    document.setString(linkNode.getAttribute("id"), "bgg-id");
                    document.setString(linkNode.getAttribute("value"), "mechanic");
                    documents.push(document);
                }
            }
        }

        return documents;
    }

    get description() {
        let descriptionNode = this.data.find("./description")[0];
        return descriptionNode ? app.api.bgg.decodeXMLEncodings(descriptionNode.string()) : undefined;
    }

    get designers() {
        let documents = [];

        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "boardgamedesigner") {
                    let document = app.document.builder();
                    document.setIdentifier("bgg-id");
                    document.setString(linkNode.getAttribute("id"), "bgg-id");
                    document.setString(linkNode.getAttribute("value"), "designer");
                    documents.push(document);
                }
            }
        }

        return documents;
    }

    get publisher() {
        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "boardgamepublisher") {
                    // only return the first one listed (set by BGG as primary)
                    return linkNode.getAttribute("value");
                }
            }
        }

        return undefined;
    }
}

//
// Video Game
//

app.classes.api.bgg.videoGame = class {
    constructor(data) {
        this.data = data;
    }

    get id() {
        return this.data.getAttribute("id");
    }

    get name() {
        let nameNode = this.data.find("./name")[0];
        return nameNode ? nameNode.getAttribute("value") : "Unknown Title";
    }

    get cover() {
        let imageURLNode = this.data.find("./image")[0];
        return imageURLNode ? app.image.fromURL(imageURLNode.string()) : undefined;
    }

    get releaseDate() {
        let releaseDateNode = this.data.find("./releasedate")[0];
        // sometimes days (and months?) are unspecified and written as "00"; convert every occurrence of this to "01" to return a valid date
        if (releaseDateNode) {
            let dateString = releaseDateNode.getAttribute("value");
            let sanitizedDate = dateString.replace(/-\b00\b/g, "-01");
            return new Date(sanitizedDate);
        }
        return undefined;
    }

    get developers() {
        let documents = [];

        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "videogamedeveloper") {
                    let document = app.document.builder();
                    document.setIdentifier("vgg-id");
                    document.setString(linkNode.getAttribute("id"), "vgg-id");
                    document.setString(linkNode.getAttribute("value"), "developer");
                    documents.push(document);
                }
            }
        }

        return documents;
    }

    get platforms() {
        let documents = [];

        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "videogameplatform") {
                    let document = app.document.builder();
                    document.setIdentifier("vgg-id");
                    document.setString(linkNode.getAttribute("id"), "vgg-id");
                    document.setString(linkNode.getAttribute("value"), "platform");
                    documents.push(document);
                }
            }
        }

        return documents;
    }

    get modes() {
        let suggestions = [];

        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "videogamemode") {
                    let id = linkNode.getAttribute("id");
                    let mode = linkNode.getAttribute("value");
                    let suggestion = app.listItem.suggest(id, mode);
                    suggestions.push(suggestion);
                }
            }
        }

        return suggestions;
    }

    get players() {
        let minPlayersNode = this.data.find("./minplayers")[0];
        let minPlayers = minPlayersNode ? minPlayersNode.getAttribute("value") : undefined;
        if (minPlayers == "0") {
            minPlayers = undefined;
        }

        let maxPlayersNode = this.data.find("./maxplayers")[0];
        let maxPlayers = maxPlayersNode ? maxPlayersNode.getAttribute("value") : undefined;
        if (maxPlayers == "0") {
            maxPlayers = undefined;
        }

        if (minPlayers && maxPlayers && minPlayers === maxPlayers) {
            return minPlayers;
        }
        if (minPlayers && maxPlayers) {
            return `${minPlayers} - ${maxPlayers}`;
        }
        return minPlayers || maxPlayers;
    }

    get genres() {
        let documents = [];

        let linkNodes = this.data.find("./link");
        if (linkNodes && linkNodes.length > 0) {
            for (let linkNode of linkNodes) {
                if (linkNode.getAttribute("type") == "videogamegenre") {
                    let document = app.document.builder();
                    document.setIdentifier("vgg-id");
                    document.setString(linkNode.getAttribute("id"), "vgg-id");
                    document.setString(linkNode.getAttribute("value"), "genre");
                    documents.push(document);
                }
            }
        }

        return documents;
    }

    get description() {
        let descriptionNode = this.data.find("./description")[0];
        return descriptionNode ? app.api.bgg.decodeXMLEncodings(descriptionNode.string()) : undefined;
    }
}

app.api.bgg = new app.classes.api.bgg();
