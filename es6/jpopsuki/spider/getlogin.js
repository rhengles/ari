import request from './requestjps';

function getLogin(cb) {
  var opt =
      { path: '/login.php'
			, done: cb
      };
	return request(opt);
}

export default getLogin;