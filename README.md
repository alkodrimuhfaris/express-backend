<h1>ExpressJS - Simple CRUD Application for E-commerce</h1>
<h4>This is a simple CRUD application specially for e-commerce. 
Built with NodeJs using the ExpressJs Framework. Express.js is a web application framework for Node.js. <a href="https://expressjs.com/">More about Express</a></h4>

<h2>Build with</h2>
#expressJS
#nodeJS

<h2>Requirements</h2>
<li>Node Js</li>
<li>Node_modules</li>
<li>Postman</li>
<li>Web Server (ex. localhost)</li>

<h2>How to run the app?</h2>
<li>Open app's directory in CMD or Terminal
<li>Type npm install
<li>Turn on Web Server and MySQL can using Third-party tool like xampp, etc.
<li>Create a database with the name items. Database consist of 4 coloms: id(primary key), name(product name), price(product price), description(product description)
<li>Open Postman desktop application or Chrome web app extension that has installed before
<li>Choose HTTP Method and enter request url.(ex. localhost:3000/)
<li>You can see all the end point <a href='#endpoint'>here</a>

<h2 id='endpoint'>End Points</h2>
<h3><li>POST (TO ADD NEW ITEMS)</h3>
<h5><li>/items</h5>
{req.body.name:'Product Name', req.body.price:Number(Product Price), req.body.description:'Product Description'}

<h3><li>GET (TO ADD NEW ITEMS)</h3>
<h5><li>/items</h5>
{req.params.page:Number(page requested), req.params.limit:Number(Limit Items per Page)}

<h5><li>/items/:id</h5> //to see items on :id


<h3><li>PUT (TO EDIT OLD ITEM)</h3>
<h5><li>/items/:id</h5>
{req.body.name:'Product Name', req.body.price:Number(Product Price), req.body.description:'Product Description'}

<h3><li>PATCH (TO PATCHING OLD ITEM)</h3>
<h5><li>/items/:id</h5>
{req.body.name:'Product Name', req.body.price:Number(Product Price), req.body.description:'Product Description'}

<h3><li>DELETE (TO PATCHING OLD ITEM)</h3>
<h5><li>/items/:id</h5> //delete items on :id
