var koa = require('koa');
var router = require('koa-router')();
var makePermaLink = require('./make-permalink');
var isLinkAlive = require('./is-link-alive');
var app = koa();

var SERVICE_NAME = 'Permalink Service';
var INDEX_HTML = `
<!doctype html>
<html>
  <head>
    <title>${SERVICE_NAME}</title>
  </head>
  <body>
    <h1>${SERVICE_NAME}</h1>
    <p>
    Welcome to the permalink service, where you can make
    sure the web pages you link to don't die.
    </p>
    <h2>Why?</h2>
    <p>
    Have you ever clicked on a link within an article and
    gotten a 404 page-not-found error? Have you ever written
    an article which linked to other web pages, in the hopes
    of helping your readers get to the resources they need,
    only to find out months later that the referred to page(s)
    have gone dead? ${SERVICE_NAME} is there to help you solve
    this problem.
    </p>
    <h2>How it works</h2>
    <p>
    When you link to a web page from your blog, instead of
    linking directly to the URL of the source, create a
    permalink and link to that instead. 
    ${SERVICE_NAME} will archive the contents of the resources
    using the Internet Archive. 
    When your readers click on the link, 
    ${SERVICE_NAME} will check to see if the linked resource is
    still available. If so, it will redirect to the original
    resource. If the resource is no longer available, it
    will instead load the saved copy of the resource from the
    Internet Archive.
    </p>
    <h2>Create a Permalink</h2>
    <form action="/create" method="POST">
      <input name="url" type="text" placeholder="URL">
      <input type="submit" value="Create Permalink">
    </form>
  </body>
</html>
`

router.get('/', function*() {
  var title = 'Permalink Service';
  this.body = INDEX_HTML;
});

router.post('/create', function*() {
  var url = this.request.body.url;
  var permalinkUrl = 
    this.request.protocol + '://' + 
    this.request.host + '/' +
    url
  try {
    yield makePermaLink(url);
    this.body = `<h1>Permalink Created</h1>
    <p>Successfully created permalink for <code>${url}</code>!</p>
    <p>The permalink is <a href="${permalinkUrl}">${permalinkUrl}</a>.</p>
    <p><a href="/">Back</a></p>`;
  } catch (e) {
    this.status = 500;
    this.body = `<h1>Failed to Create Permalink</h1>
    <p>Failed to create permalink for ${url} because "${e.message}"</p>
    <p><a href="/">Back</a></p>`;
  }
});

router.get(/^\/(.+)$/, function*() {
  var url = this.params[0];
  var alive = yield isLinkAlive(url);
  if (alive) {
    this.redirect(url);
  } else {
    this.redirect(`https://web.archive.org/web/*/${url}`);
  }
});

app
  .use(require('koa-body-parser')())
  .use(router.routes())
  .use(router.allowedMethods());
  
var port = 3000;
app.listen(port);
console.log(`Listening on ${port}`);