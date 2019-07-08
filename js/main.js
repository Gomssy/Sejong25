var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    backgroundColor: Phaser.Display.Color.GetColor(0,0,0),
    scene: [ menuScene, gameScene ]
};

var game = new Phaser.Game(config)

//플레이어 정보, 서버 통신시 필요할 듯
//테스트용이므로 차후 수정 요망
var playerNum = -1; //플레이어 아이디, 고유 번호
var playerName = '임시아이디' //플레이어 닉네임