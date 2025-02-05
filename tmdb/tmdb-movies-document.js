app.api.tmdb.api_key = "YOUR API KEY";
app.api.tmdb.language = "en-US";

let movie = app.api.tmdb.getMovie(app.params.id);

if (movie == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(movie.title, "title");
builder.setString(movie.originalTitle(), "original-title");
builder.setImage(movie.requestPoster(), "poster");
builder.setDate(movie.releaseDate, "release-date");
builder.setDecimal(movie.runtime, "runtime");
builder.setDocuments(movie.genresAsDocuments(), "genres");
builder.setString(movie.overview, "synopsis");
builder.setDocuments(movie.directors, "directors");
builder.setDocuments(movie.actors(10), "actors");
builder.setString(movie.id, "tmdb-id");

app.result(builder);
