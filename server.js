/* Skeleton server application
to get started at localhost: npm install / npm run start
on the server: npm install / npm run build / docker build -t [imageName] .
then start a mongo container: screen docker run --restart=always --name devMongo -p 27017:27017 -d mongo
then deploy: docker run  --restart=always [--name MyContainer] --link devMongo:devMongo -p [PORT exposed to the outside e.g. 8081]:3000 [imageName]
*/

function main() {
    const path = require('path');
    const express = require('express');
    const webpack = require('webpack');
    const webpackMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const config = require('./webpack.config.js');

    const mongoose = require('mongoose');

    const isDeveloping = process.env.NODE_ENV !== 'production';

    const mongoAddress = isDeveloping ? 'mongodb://localhost/project' : 'mongodb://devMongo:27017/project';
    mongoose.connect(mongoAddress);
    var db =mongoose.connection;
    db.on('error',console.error);
    db.once('open', function() {
    var nameSchema = mongoose.Schema({ _id: String, name: String });
    var Name = mongoose.model('Name', nameSchema);
    Name.find({}, function(err,name) { console.log('##'+name); });
    //var tom = new Name({_id:'3',name:'createdhere'});
    //tom.save( function(err,tom) { console.log(tom); });
    //Name.find({}, (err,names)=>console.log(names));
    //db.close();
    });


    const port = isDeveloping ? 3000 : process.env.PORT;
    const app = express();
    app.use(express.static('public')); // serve static files - JS, CSS, fonts etc - from the public directory
    // e.g. on the filesystem /home/app/public/jquery.js would become http://localhost:3000/jquery.js

    if (isDeveloping) {
      const compiler = webpack(config);
      const middleware = webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        contentBase: 'src',
        stats: {
          colors: true,
          hash: false,
          timings: true,
          chunks: false,
          chunkModules: false,
          modules: false
        }
      });

      app.use(middleware);
      app.use(webpackHotMiddleware(compiler));
      app.get('/zig2/:id', function response(req, res) {
        res.write(req.params.id);
        res.write('ZIG');
        res.end();
      });
      app.get('*', function response(req, res) {
        res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
        res.end();
      });
    } else {
      app.use('/public', express.static('public'));
      app.use(express.static(__dirname + '/dist'));
      app.get('/', function response(req, res) {
        res.sendFile(path.join(__dirname, 'dist/index.html'));
      });

    }

    app.listen(port, '0.0.0.0', function onStart(err) {
      if (err) {
        console.log(err);
      }
      console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
      //console.log(Name.find({_id:1},function(err,names) { console.log(names); }));
      //console.log(Name.find());
      //Name.find({},(err,names)=>console.log(names));
    });
};

main();

var multiply = require('./functions/multiply.js').multiply;
module.exports = { testFunc: function(avar) { return avar; }, mulFunc: function(a,b) { return multiply(a,b); } };
