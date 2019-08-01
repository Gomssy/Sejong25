var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    autoRound: false,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    backgroundColor: Phaser.Display.Color.HexStringToColor('#F0CB85').color,//GetColor(245,208,138),
    scene: [ menuScene, roomScene, gameScene ]
};

var game = null;

//플레이어 정보, 서버 통신시 필요할 듯
//테스트용이므로 차후 수정 요망
var PlayerData = PlayerData || {};

PlayerData.id = -1; //플레이어 아이디, 고유 번호
PlayerData.nickname = '홍길동'; //플레이어 닉네임

// 현재 들어가있는 Game Room의 정보
var RoomData = RoomData || {};

RoomData.roomId = -1;
RoomData.myself = null;
RoomData.players = null;
RoomData.aliveCount = -1;