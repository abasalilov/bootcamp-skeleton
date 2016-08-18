/* eslint no-console: 0 */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/project');
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

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

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
  app.get('/zig', function response(req,res) {
    console.log(req.params);
    res.write(JSON.stringify(req.params));
    res.end();
  });
  app.get('/zig2/:id', function response(req, res) {
    res.write(req.params.id);
    res.end();
  });
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
app.get('/zig', function response(req,res) {
	res.write('ZIGBOAB');
	res.end();
  });
  app.get('*', function response(req, res) {
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
