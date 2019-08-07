function FirebaseClient()
{
    this.init();
    this.initEvent();
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
	});
	
	document.getElementById('mainTitle').style.display = 'none';
	document.getElementById('titleImg').style.display = 'none';
}

FirebaseClient.prototype.setLogOut = function()
{

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
		this.auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
			.then(cbSignInEmail.bind(this));
	}
}

FirebaseClient.prototype.createEmailUser = function()
{
	var email = document.getElementById('userEmail').value.trim();
	var password = document.getElementById('userPassword').value.trim();
	// 유효성 검증
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
	{
		var cbCreateUserWithEmail = function(user){
			console.log('이메일 가입 성공 : ', JSON.stringify(user));
			//프로필 업데이트 - 이메일 가입시 유저이름 파라미터를 보내지 않으므로 가입 성공 후 처리
			firebase.auth().currentUser.updateProfile({
				displayName: email,
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
		this.auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
			.then(cbAfterPersistence.bind(this))
			.catch(function(error) {
				console.error('인증 상태 설정 중 에러 발생' , error);
			});	
	}
}

FirebaseClient.prototype.onGoogleBtnClick = function()
{
	var googleProvider = new firebase.auth.GoogleAuthProvider();
	this.auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
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
	var updates = {};
	switch(key)
	{
		case 'exp':
			updates.exp = replace ? (valueChanged) : (beforeData.exp + valueChanged);
			beforeData.exp = updates.exp;
			break;
		case 'rank':
			updates.rank = replace ? (valueChanged) : (beforeData.rank + valueChanged);
			beforeData.rank = updates.rank;
			break;
		case 'hopae':
			if (beforeData.hopae != null)
			{
				updates.hopae.push(valueChanged);
				beforeData.hopae.push(valueChanged);
			}
			else
			{
				beforeData.hopae = [valueChanged];
				updates.hopae = [valueChanged];
			}
			break;
		case 'recentHopae':
			updates.recentHopae = valueChanged;
			beforeData.recentHopae = updates.recentHopae;
			break;
		case 'title':
			if (beforeData.title != null)
			{
				updates.title.push(valueChanged);
				beforeData.title.push(valueChanged);
			}
			else
			{
				beforeData.title = [valueChanged];
				updates.title = [valueChanged];
			}
			break;
		case 'money':
			updates.money = replace ? (valueChanged) : (beforeData.money + valueChanged);
			beforeData.money = updates.money;
			break;
		case 'item':
			if (beforeData.item != null)
			{
				updates.item.push(valueChanged);
				beforeData.item.push(valueChanged);
			}
			else
			{
				beforeData.item = [valueChanged];
				updates.item = [valueChanged];
			}
			break;
		default:
			console.log('[ERROR] database has no key for ' + key);
			break;
	}
	PlayerData.userData = beforeData;
	console.log(updates.recentHopae);
	return this.database.ref('/user-data/' + this.auth.currentUser.uid).update(updates);
}

document.addEventListener('DOMContentLoaded', function()
{
    window.fbClient = new FirebaseClient();
    console.log('done load');
});

class UserData
{
    constructor()
    {
        this.userName = prompt("유저의 이름을 입력해주세요.");
        this.exp = 0;
        this.rank = -1;
        this.hopae = 
        [
            {name: prompt("첫번째 호패의 닉네임을 입력해주세요."), type: 'wood'}
		];
		this.recentHopae = '';
		this.title = [];
		this.money = 0;
		this.item = [];
    }
}