var qs   = require('querystring');
var fs   = require('fs');
var jwt  = require('jsonwebtoken');

// Content
var index      = fs.readFileSync(__dirname+'/index.html');      // default page
var restricted = fs.readFileSync(__dirname+'/restricted.html'); // only show if JWT valid
var fail       = fs.readFileSync(__dirname+'/fail.html');       // auth fail

// secret
var secret = "CHANGE_THIS_TO_SOMETHING_RANDOM";

// show fail page (login)
function authFail(res) {
  res.writeHead(401, {'Content-Type': 'text/html'});
  res.end(fail);
}

function authSuccess(req, res) {
  // create JWT
  var token = jwt.sign({
    auth:  'magic',
    agent: req.headers['user-agent'],
    exp:   new Date().getTime() + 7*24*60*60*1000 // JS timestamp is ms...
  }, secret);

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'x-access-token': token
  });
  res.end(restricted);
}

// handle authorisation requests
function authHandler(req,res){
  // lookup person in database
  var usr = { un: 'masterbuilder', pw: 'itsnosecret' };

  console.log("METHOD: "+req.method)
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      // authentication success
      if(post.username && post.username === usr.un && post.password && post.password === usr.pw){
        authSuccess(req, res);
      } else {
        return authFail(res);
      }
    });
  } else {
    return authFail(res);
  }
}

function tokenValid(req, res) {
  console.log(req.headers)
  var token = req.headers['x-access-token'];
  var decoded = jwt.verify(token, secret);
  console.log(decoded);
  return true;
}

module.exports = {
  fail : authFail,
  success : authSuccess,
  handler : authHandler,
  validate : tokenValid,
  index: index,
  restricted: restricted
}
