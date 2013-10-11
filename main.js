var express = require('./node_modules/express');

var app = express();
var port = 1337;
var server = app.listen(port);

app.use(express.bodyParser());
app.use(express.cookieParser('_(:3_<)_...QQBoxy'));
app.use(express.session({secret : '_(:3_<)_...QQBoxy'}));

var session = {
	maxAge : 10*1000, //Session存活時間長度(10秒)
	login : function(req, res) {
		var date = Date.now();
		req.session.lastlogin = date;
		req.session.cookie.expires = new Date(date + session.maxAge);
		req.session.cookie.maxAge = session.maxAge;
	},
	logout : function(req, res) {
		if(req.session.lastlogin) {
			req.session.destroy();
		}
	},
	renew : function(req, res, next) {
		if(req.session.lastlogin) {
			var date = Date.now();
			req.session.lastlogin = date;
			req.session.cookie.expires = new Date(date + session.maxAge);
			req.session.cookie.maxAge = session.maxAge;
		}
		next();
	},
	check : function(req, res, next) {
		if(req.session.lastlogin) {
			next();
		} else {
			res.redirect('/login.html'); //權限不足，跳轉登入頁面
		}
	}
};

//目錄修正
app.all('*', function(req, res, next) {
	if(req.url.match(/\/[^.\/]+$/)) { //由『/app』修正為『/app/』
		res.redirect(req.url + '/');
	} else {
		next();
	}
});

//延長時效
app.all('*', session.renew);

//權限檢查
app.all('/app*', session.check);

//開放目錄
app.use('/', express.static(__dirname + '/public/'));

//隱私目錄
app.use('/app/', express.static(__dirname + '/private/'));

//登入帳號
app.post('/login', function (req, res) {
	if(req.body.account == 'admin' && req.body.password == 'test') {
		session.login(req, res);
		res.redirect('/app/'); //帳號密碼正確，跳轉私密頁面。(或 res.redirect('/app/index.html');)
	} else {
		res.redirect('/login.html'); //帳號密碼錯誤，跳轉登入頁面
	}
});

//登出帳號
app.get('/logout', function (req, res) {
	session.logout(req, res);
	res.send("Logout.");
});

console.log('Start express server. port:' + port);