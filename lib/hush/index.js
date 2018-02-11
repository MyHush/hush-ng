const http = require('http')

 function Config (conffile) {
  conffile = conffile || 'hush.conf'
  const fs = require('fs');
  var platform = require('os').platform()
  if (platform == "linux") {
    var path = require('os').homedir() + '/.hush/'
    conffile = path + conffile
  }
  else if (platform == "win32") {
    if (!fs.existsSync(process.env.APPDATA + '\\Hush')) {
      fs.mkdirSync(process.env.APPDATA + '\\Hush')
    }
    var path = process.env.APPDATA + '\\Hush\\'
    conffile = path + conffile
  }
  else {
    // TODO
    throw "Unsupported OS"
  }
  // Read all lines from config file, remove commented lines and empty lines.
  self.filteredlines = require('fs').readFileSync(conffile, 'utf-8').split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
  // Create a dictionary from keys and values
  self.keysvalues = self.filteredlines.reduce(function(map, line) {
    var sp = line.split('=', 2)
    if (sp.length == 2) {
        map[sp[0].trim()] = sp[1].trim();
    }
    return map;
  }, {});
}

Config.prototype.get = function (name) {
  return self.keysvalues[name]
};
Config.prototype.rpcuser = function (name) {
  return self.keysvalues['rpcuser']
};
Config.prototype.rpcpassword = function (name) {
  return self.keysvalues['rpcpassword']
};
Config.prototype.rpcport = function (name) {
  return this.get('testnet') == 1 ? 18822 : 8822
};

// split into separate file
function RpcClient(options) {
  self.options = options;
}

RpcClient.prototype.post = function (method, params, callback) {
  var body = JSON.stringify({ method: method, params: params })
  var options = {
      port: self.options.port,
      hostname: "localhost",
      auth: self.options.user + ':' + self.options.pass,
      method: 'POST',
      path: '/',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
      }
  };
  var req = http.request(options, function(res) {
      res.on('data', function (body) {
          if (callback != null) {
              callback(null, JSON.parse(body));
          }
      });
  });
  req.on('error', function(err) {
      callback(err, null);
  });
  req.write(body);
  req.end('\n');
}

module.exports =   {
   Config:Config,
   RpcClient:RpcClient
}

