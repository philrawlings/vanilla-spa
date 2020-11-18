class App {

    constructor(routes) {
        this.routes = routes;      
    }

    pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

    getParams = match => {
        const values = match.result.slice(1);
        const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

        return Object.fromEntries(keys.map((key, i) => {
            return [key, values[i]];
        }));
    };

    navigateTo = url => {
        history.pushState(null, null, url);
        this.router();
    };

    router = async () => {

        // Test each route for potential match
        const potentialMatches = this.routes.map(route => {
            return {
                route: route,
                result: location.pathname.match(this.pathToRegex(route.path))
            };
        });

        let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

        if (!match) {
            match = {
                route: this.routes[0],
                result: [location.pathname]
            };
        }

        console.log(match.route.path);

        // TODO: if the route is of type hbs, need to pass the route parameters to the template and render it.
        // Currently hbs files are loaded the same as html, so wont be rendered. Maybe consider compiling on first load and using the compiled template?
        this.currentParams = this.getParams(match);
        console.log(this.currentParams);

        fetch(`/views/${match.route.view}`).then(response => {
            return response.text();
        }).then(data => {

            let parser = new DOMParser();
            let doc = parser.parseFromString(data, "text/html");
            let viewDiv = document.createElement("div");
            viewDiv.id = "view-div";
            let shadow = viewDiv.attachShadow({ mode: "open" });
            shadow.appendChild(doc.documentElement);

            // Load scripts in the order they are defined
            // Note that inserting scripts into an element using innerHTML doesnt work - hence this logic
            var scripts = shadow.querySelectorAll("script");
            var shadowBody = shadow.querySelector("body");

            if (scripts !== null && scripts.length > 0) {
                var loadScript = index => {
                    if (index < scripts.length) {
                        var newScript = doc.createElement("script");

                        if (scripts[index].innerText) {
                            var inlineScript = doc.createTextNode(scripts[index].innerText);
                            newScript.appendChild(inlineScript);
                        }
                        else {
                            newScript.src = scripts[index].src;
                        }
                        scripts[index].parentNode.removeChild(scripts[index]);
                        newScript.addEventListener("load", event => loadScript(index + 1));
                        newScript.addEventListener("error", event => loadScript(index + 1));
                        shadowBody.appendChild(newScript);
                    }
                }

                loadScript(0); // Start loading script 0. Function is recursive to load scripts synchronously.
            }

            const app = document.getElementById("app");
            app.innerHTML = "";
            app.appendChild(viewDiv);

        }).catch(err => {
            console.warn('Something went wrong.', err);
        });
    };
}

// Function hoisting (to allow easier searching of app shadowroot)

// getElementById: search the main document first, then search the view shadow root
document.baseGetElementById = document.getElementById;
document.getElementById = id => {
    const result = document.baseGetElementById(id);
    if (result !== null)
        return result;
    else {
        const appElem = document.getElementById("app");
        if (appElem !== null && appElem.firstElementChild !== null && appElem.firstElementChild.shadowRoot !== null) {
            return appElem.firstElementChild.shadowRoot.getElementById(id);
        }
        else
            return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // Load app view definitions from server
    fetch(`/api/app/views`)
        .then(response => response.json())
        .then(routes => {

            // Create app
            const app = new App(routes);
            app.router();

            // Handle history changes
            window.addEventListener("popstate", app.router);

            // Handle navigation (intercept any links with data-link attribute)
            document.body.addEventListener("click", e => {
                if (e.target.matches("[data-link]")) {
                    e.preventDefault();
                    if (app !== null)
                        app.navigateTo(e.target.href);
                }
            });
        })
        .catch(err => alert("Failed to load view definitions"));

});
