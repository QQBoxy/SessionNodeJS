var express = require('./node_modules/express');

var app = express();
var port = 1337;
var server = app.listen(port);

app.use(express.bodyParser());
app.use(express.cookieParser('_(:3_<)_...QQBoxy'));
app.use(express.session({secret : '_(:3_<)_...QQBoxy'}));

var session = {
	maxAge : 10*1000, //Session�s���ɶ�����(10��)
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
			res.redirect('/login.html'); //�v�������A����n�J����
		}
	}
};

//�ؿ��ץ�
app.all('*', function(req, res, next) {
	if(req.url.match(/\/[^.\/]+$/)) { //�ѡy/app�z�ץ����y/app/�z
		res.redirect(req.url + '/');
	} else {
		next();
	}
});

//�����ɮ�
app.all('*', session.renew);

//�v���ˬd
app.all('/app*', session.check);

//�}��ؿ�
app.use('/', express.static(__dirname + '/public/'));

//���p�ؿ�
app.use('/app/', express.static(__dirname + '/private/'));

//�n�J�b��
app.post('/login', function (req, res) {
	if(req.body.account == 'admin' && req.body.password == 'test') {
		session.login(req, res);
		res.redirect('/app/'); //�b���K�X���T�A����p�K�����C(�� res.redirect('/app/index.html');)
	} else {
		res.redirect('/login.html'); //�b���K�X���~�A����n�J����
	}
});

//�n�X�b��
app.get('/logout', function (req, res) {
	session.logout(req, res);
	res.send("Logout.");
});

console.log('Start express server. port:' + port);