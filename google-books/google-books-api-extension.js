app.classes.api.googleBooks.volume.prototype.subtitle = function() {
    return this.volumeInfo.subtitle;
};


app.classes.api.googleBooks.volume.prototype.categoriesAsDocuments = function(categories) {
    let documents = [];

    for (let category of categories) {
        let document = app.document.builder();
        document.setIdentifier("genre");
        let capitalizedCategoryName = category
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        document.setString(capitalizedCategoryName, "genre");
        documents.push(document);
    }

    return documents;
};


app.classes.api.googleBooks.volume.prototype.description = function() {
    let rawDescription = this.volumeInfo.description;
    if (rawDescription) {
        return rawDescription
            // Remove <p> at start of string without adding a newline
            .replace(/^<p>/i, "")
            // Replace all other <p> tags with newlines
            .replace(/<p>/gi, "\n")
            // Replace <br>, <br/>, <br /> tags with newlines
            .replace(/<br\s*\/?>/gi, "\n")
            // Remove all other HTML tags
            .replace(/<\/?[^>]+(>|$)/g, "");
    }

    return undefined;
};


app.classes.api.googleBooks.volume.prototype.language = function() {
    return this.volumeInfo.language;
};
