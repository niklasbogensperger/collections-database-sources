let volume = app.api.googleBooks.getVolume(app.params.id);

if (volume == undefined) {
    app.fail();
}

let builder = app.document.builder();

builder.setString(volume.title, "title");
builder.setString(volume.subtitle(), "subtitle");
builder.setImage(volume.requestImage(), "cover");
builder.setDocuments(volume.authors, "authors");
builder.setDate(volume.publishedDate, "date-published");
builder.setInteger(volume.pageCount, "page-count");
builder.setDocuments(volume.categoriesAsDocuments(app.params.categories), "genres");
builder.setString(volume.description(), "description");
builder.setString(volume.publisher, "publisher");
builder.setString(volume.language(), "language");
builder.setString(volume.ISBN_13, "isbn-13");
builder.setString(volume.id, "google-books-id");

app.result(builder);
