# Vanilla SPA

A single page application example using aspnetcore 5.0.
The server application contains very little logic, so could be hosted easily using another server-side framework.

This is very experimentation only (at this stage) to trial these concepts:

- Client-side routing with support for back/forward buttons
- Dynamically loading HTML views without reloading the entire page
- Views defined as HTML files delivered by the server (rather than embedded in js/jsx files and referenced explictly)
- Adding view-referenced JavaScript to the DOM and executing it (including debugging using browser dev-tools)
- Client side templating using Handlebars (not complete. Not sure whether the model passed to the template will just be the url/route parameters or a more complete model class)
- Views loaded into shadow DOM to allow for CSS isolation

## Links

Inspired by:
https://github.com/dcode-youtube/single-page-app-vanilla-js

## Known Issues

- Sometimes fails to loads view definitions on first run. Havent worked out why yet, refresh the page and it will work.
- Not 100% convinced that use of the shadow DOM is right/necessary here, alternative approach for the loading content directly shown [here](https://stackoverflow.com/questions/57987543/how-do-i-use-the-fetch-api-to-load-html-page-with-its-javascript/64878810#64878810).