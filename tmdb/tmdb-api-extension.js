//
// Search by ID
//

app.classes.api.tmdb.prototype.searchById = function(type, id) {
    let searchResults = [];

    if (this.api_key === "YOUR API KEY" || !this.api_key) {
        app.api.error(this.apiErrorMessage);
        return searchResults;
    }

    let url = this.getEndpoint(`/${type}/${id}`);
    url += "?api_key=" + this.api_key;
    url += "&language=" + encodeURIComponent(this.language);

    let request = app.request(url);
    let response = request.send();

    if (response.statusCode === 200) {
        let data = response.json();
        if (data) {
            let result = type === "movie" ? new app.classes.api.tmdb.movieResult(data) : new app.classes.api.tmdb.tvResult(data);
            let searchResult = app.searchResult.new();
            searchResult.title = type === "movie" ? result.title : result.name;
            searchResult.subtitle = result.year?.toString();
            searchResult.imageURL = result.thumbnail;
            searchResult.params = { id: result.id };
            searchResults.push(searchResult);
        }
    }

    return searchResults;
};

app.classes.api.tmdb.prototype.searchMovieById = function(id) {
    return this.searchById("movie", id);
};

app.classes.api.tmdb.prototype.searchTVById = function(id) {
    return this.searchById("tv", id);
};

//
// Original Language Title/Name
//

app.classes.api.tmdb.movie.prototype.originalTitle = function() {
    return this.data.original_title === this.data.title ? undefined : this.data.original_title;
};

app.classes.api.tmdb.tv.prototype.originalName = function() {
    return this.data.original_name === this.data.name ? undefined : this.data.original_name;
};

//
// Return Genres as Documents
//

function genresAsDocuments() {
    let documents = [];

    let genres = this.data.genres;
    if (genres) {
        for (let genre of genres) {
            let document = app.document.builder();
            document.setIdentifier("tmdb-id");
            document.setString(genre.id, "tmdb-id");
            let capitalizedGenreName = genre.name
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
            document.setString(capitalizedGenreName, "genre");
            documents.push(document);
        }
    }

    return documents;
};

app.classes.api.tmdb.movie.prototype.genresAsDocuments = genresAsDocuments;

app.classes.api.tmdb.tv.prototype.genresAsDocuments = genresAsDocuments;
