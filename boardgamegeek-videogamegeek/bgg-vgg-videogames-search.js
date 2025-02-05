let type = "videogame";

if (app.query.value.startsWith("nex:")) {
    // non-exact search mode
    app.query.value = app.query.value.substring(4).trim();
    let results = app.api.bgg.searchThings(app.query, type, 0);
    app.result(results);
} else {
    // exact search mode (default)
    let results = app.api.bgg.searchThings(app.query, type);
    app.result(results);
}
