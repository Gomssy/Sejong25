function FirebaseClient()
{
    this.init();
	this.initEvent();
	this.isGameStarted = false;
}

FirebaseClient.prototype.init = function()
{
    this.auth = firebase.auth();
    this.googleBtn = document.getElementById('googleBtn');
    this.emailBtn = document.getElementById('emailBtn');
    this.joinBtn = document.getElementById('joinBtn');
}

FirebaseClient.prototype.initEvent = function()
{
    this.auth.onAuthStateChanged(this.onAuthChange.bind(this));
    
	this.googleBtn.addEventListener('click', this.onGoogleBtnClick.bind(this));
	this.emailBtn.addEventListener('click', this.onEmailBtnClick.bind(this));
	this.joinBtn.addEventListener('click', this.createEmailUser.bind(this));
	
	document.getElementById('joinOpenBtn').addEventListener('click', function()
	{
		document.getElementById('dvNewEmail').style.display = 'block';
		document.getElementById('dvLogin').style.display = 'none';
	});
	document.getElementById('joinCancelBtn').addEventListener('click', function()
	{
		document.getElementById('dvNewEmail').style.display = 'none';
		document.getElementById('dvLogin').style.display = 'block';
	})
}

FirebaseClient.prototype.logOut = function()
{
	if (confirm('Logout?'))
	{
		if (this.database)
		{
			this.database.goOffline();
		}
		this.auth.signOut();
	}
}

FirebaseClient.prototype.onAuthChange = function(user)
{
	if (user)
	{
		console.log('user로그인');
		this.setLogin();
	}
	else
	{
		console.log('로그아웃');
		this.setLogOut();
	}
}

FirebaseClient.prototype.setLogin = function()
{
    this.database = firebase.database();
	this.database.goOnline();
	
	var userDataRef = this.database.ref('/user-data/' + this.auth.currentUser.uid);
	userDataRef.once('value').then(function(snapshot)
	{
		if (snapshot.exists())
		{
			PlayerData.userData = snapshot.val();
		}
		else
		{
			let newUserData = new UserData();
			PlayerData.userData = newUserData;
			userDataRef.set(newUserData);
		}
	})
	.then(function()
	{
		game = new Phaser.Game(config);
		fbClient.isGameStarted = true;
	});
	
	document.getElementById('mainTitle').style.display = 'none';
	document.getElementById('titleImg').style.display = 'none';
}

FirebaseClient.prototype.setLogOut = function()
{
	if (game != null) game.destroy(true);
	this.isGameStarted = false;
	document.getElementById('mainTitle').style.display = 'block';
	document.getElementById('titleImg').style.display = 'block';
}

FirebaseClient.prototype.onEmailBtnClick = function()
{
    var email = document.getElementById('userEmail').value.trim();
	var password = document.getElementById('userPassword').value.trim();
	if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) && password.length > 0)
	{ // 유효성 체크
		var cbSignInEmail = function() 
		{
			return this.auth.signInWithEmailAndPassword(email, password)
				.then(function()
				{
					console.log('이메일 로그인 성공');
				})
				.catch(function(error) 
				{
					console.error('이메일 로그인 과정 에러', error);
					switch(error.code)
					{
						case "auth/invalid-email":
							alert('유효하지 않은 메일입니다');
							break;
						case "auth/user-disabled":
							alert('사용이 정지된 유저 입니다.')
							break;
						case "auth/user-not-found":
							alert('사용자를 찾을 수 없습니다.')
							break;
						case "auth/wrong-password":
							alert("잘못된 패스워드 입니다.");
							break;
					}
				});
		}
		this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
			.then(cbSignInEmail.bind(this));
	}
}

FirebaseClient.prototype.createEmailUser = function()
{
	var email = document.getElementById('newEmail').value.trim();
	var password = document.getElementById('newPassword').value.trim();
	var passCheck = document.getElementById('newPasswordCheck').value.trim();
	var newUserName = document.getElementById('newName').value.trim();
	// 유효성 검증
	if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)))
	{
		alert('잘못된 이메일입니다.');
		return;
	}
	else if (password != passCheck)
	{
		alert('비밀번호와 비밀번호 확인이 다릅니다.')
		return;
	}
	else if (newUserName.length === 0)
	{
		alert('닉네임을 작성해주세요.')
		return;
	}
	else
	{

		var cbCreateUserWithEmail = function(user){
			console.log('이메일 가입 성공 : ', JSON.stringify(user));
			//프로필 업데이트 - 이메일 가입시 유저이름 파라미터를 보내지 않으므로 가입 성공 후 처리
			firebase.auth().currentUser.updateProfile({
				displayName: newUserName,
			}).then(function() {
				console.log('userName 업데이트 성공')
			}).catch(function(error) {
				console.error('userName 업데이트 실패 : ', error );
			});
		/*
		//인증 메일 발송
		this.auth.useDeviceLanguage(); // 이메일 기기언어로 세팅
		user.sendEmailVerification().then(function() {
			console.log('인증메일 발송 성공')
		}).catch(function(error) {
			console.error('인증메일 발송 에러', error);
		});*/
		}
		document.getElementById('dvLogin').style.display = 'block';
		document.getElementById('dvNewEmail').style.display = 'block';
		var cbAfterPersistence = function(){
		return this.auth.createUserWithEmailAndPassword(email, password)
			.then(cbCreateUserWithEmail.bind(this))
			.catch(function(error) {
				console.error('이메일 가입시 에러 : ', error);
				switch(error.code){
					case "auth/email-already-in-use":
						alert('이미 사용중인 이메일 입니다.');
						break;
					case "auth/invalid-email":
						alert('유효하지 않은 메일입니다');
						break;
					case "auth/operation-not-allowed":
						alert('이메일 가입이 중지되었습니다.');
						break;
					case "auth/weak-password":
						alert("비밀번호를 6자리 이상 필요합니다");
						break;
				}
			});
		}
		this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
			.then(cbAfterPersistence.bind(this))
			.catch(function(error) {
				console.error('인증 상태 설정 중 에러 발생' , error);
			});
	}
}

FirebaseClient.prototype.onGoogleBtnClick = function()
{
	var googleProvider = new firebase.auth.GoogleAuthProvider();
	this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
	.then(this.signInWithPopup.bind(this, googleProvider))
	.catch(function(error)
	{
		console.error('인증 상태 설정 중 에러 발생', error);
	});
}

FirebaseClient.prototype.signInWithPopup = function(provider) 
{
	return  this.auth.signInWithPopup(provider).then(function(result) 
	{
		console.log('로그인 성공')
	}).catch(function(error) 
	{
		alert('로그인에 실패하였습니다');
		console.error('로그인 에러',error);
	});
}

FirebaseClient.prototype.updateUserData = function(key, valueChanged, replace = false)
{
	var beforeData = PlayerData.userData;
	switch(key)
	{
		case 'exp':
			beforeData.exp = replace ? (valueChanged) : (beforeData.exp + valueChanged);
			break;
		case 'rank':
			beforeData.rank = replace ? (valueChanged) : (beforeData.rank + valueChanged);
			break;
		case 'hopae':
			if (beforeData.hopae != null) beforeData.hopae.push(valueChanged);
			else beforeData.hopae = [valueChanged];
			break;
		case 'recentHopae':
			beforeData.recentHopae = valueChanged;
			break;
		case 'title':
			if (beforeData.title != null) beforeData.title.push(valueChanged);
			else beforeData.title = [valueChanged];
			break;
		case 'money':
			beforeData.money = replace ? (valueChanged) : (beforeData.money + valueChanged);;
			break;
		case 'item':
			if (beforeData.item != null) beforeData.item.push(valueChanged);
			else beforeData.item = [valueChanged];
			break;
		case 'killCount':
			beforeData.killCount = replace ? (valueChanged) : (beforeData.killCount + valueChanged);
			break;
		case 'skin':
			beforeData.skin = valueChanged;
			break;
		default:
			console.log('[ERROR] database has no key for ' + key);
			break;
	}
	PlayerData.userData = beforeData;
	return this.database.ref('/user-data/' + this.auth.currentUser.uid).update(beforeData);
}

document.addEventListener('DOMContentLoaded', function()
{
	var filter = "win16|win32|win64|mac|macintel";
	if ( navigator.platform ){
		if ( filter.indexOf(navigator.platform.toLowerCase())<0 ){
			document.getElementById('dvLogin').style.display = 'none';
			document.getElementById('notSupport').style.display = 'block';
		}
		else 
		{
			window.fbClient = new FirebaseClient();	
			
			document.onkeydown = function(e)
			{
				if (!fbClient.isGameStarted && e.keyCode === 13)
				{
					fbClient.onEmailBtnClick();
				}
				else if (fbClient.isGameStarted && e.keyCode === 27)
				{
					fbClient.logOut();
				}
			}
		}
	}
    console.log('done load');
});

class UserData
{
    constructor()
    {
        this.userName = fbClient.auth.currentUser.displayName;
        this.exp = 0;
        this.rank = -1;
        this.hopae = [];
		this.recentHopae = null;
		this.title = [];
		this.money = 0;
		this.item = [0];
		this.killCount = 0;
		this.skin = 0;
    }
}