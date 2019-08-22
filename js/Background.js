var BackGround = BackGround || {}

BackGround.brainGroup = null;
BackGround.characterPos = [
    new Phaser.Math.Vector2(100, 99), new Phaser.Math.Vector2(248, 198), new Phaser.Math.Vector2(412, 144), new Phaser.Math.Vector2(124, 393), 
    new Phaser.Math.Vector2(368, 336), new Phaser.Math.Vector2(272, 453), new Phaser.Math.Vector2(100, 595), new Phaser.Math.Vector2(284, 678), 
    new Phaser.Math.Vector2(444, 639), new Phaser.Math.Vector2(116, 799), new Phaser.Math.Vector2(413, 789), new Phaser.Math.Vector2(280, 916), 
    new Phaser.Math.Vector2(1437, 157), new Phaser.Math.Vector2(1672, 95), new Phaser.Math.Vector2(1832, 166), new Phaser.Math.Vector2(1581, 239), 
    new Phaser.Math.Vector2(1779, 311), new Phaser.Math.Vector2(1595, 414), new Phaser.Math.Vector2(1774, 480), new Phaser.Math.Vector2(1501, 563), 
    new Phaser.Math.Vector2(1736, 655), new Phaser.Math.Vector2(1446, 770), new Phaser.Math.Vector2(1656, 894), new Phaser.Math.Vector2(1826, 819), 
]
BackGround.otherCharacters = [];

BackGround.drawCharacter = function(scene)
{
    RoomData.myself.playerImage = scene.add.sprite(game.config.width / 2, game.config.height * 41 / 48, Enums.characterSkin[PlayerData.userData.skin] + 'Write')
        .setScale(0.45).setDepth(5);
    RoomData.myself.position = new Phaser.Math.Vector2(RoomData.myself.playerImage.x - 20, RoomData.myself.playerImage.y - 20);
    RoomData.myself.mat = scene.add.sprite(RoomData.myself.position.x, RoomData.myself.position.y, 'mat')
        .setScale(0.45).setDepth(4);
    BackGround.characterPos = BackGround.characterPos.sort(function(){return 0.5-Math.random()});
    RoomData.players.forEach(function(element){
        if(element.id != RoomData.myself.id)
        {
            element.position = BackGround.characterPos.pop();
            element.playerImage = scene.add.sprite(element.position.x, element.position.y, Enums.characterSkin[element.skin] + 'Write')
                .setScale(0.315).setDepth(5);
            element.playerImage.flipX = element.position.x < game.config.width / 2 ? true : false;
            element.mat = scene.add.sprite(element.position.x - 14 * (element.position.x < game.config.width / 2 ? -1 : 1), element.position.y - 14, 'mat')
                .setScale(0.315).setDepth(4);
            element.mat.flipX = element.position.x < game.config.width / 2 ? true : false;
            element.nicknameText = scene.add.text(element.position.x, element.position.y - 90, element.nickname)
                .setOrigin(0.5,0.5).setColor('#000000').setPadding(0.5,0.5,0.5,0.5).setDepth(5.1);
6        }
    });
}

BackGround.gameBackground = null;

BackGround.drawBrain = function(scene)
{
    BackGround.gameBackground = scene.add.sprite(game.config.width / 2, game.config.height / 2, 'gameBackground').setDisplaySize(game.config.width, game.config.height).setDepth(3.1);
}

BackGround.drawBackground = function(scene)
{
    scene.add.sprite(game.config.width / 2, game.config.height / 2, 'baseBackground').setDisplaySize(game.config.width, game.config.height).setDepth(0);
}

BackGround.drawMenu = function(scene)
{
    scene.add.sprite(game.config.width / 2, game.config.height / 2, 'menuBackground').setDisplaySize(game.config.width, game.config.height).setDepth(3);
}

BackGround.drawRoom = function(scene)
{
    scene.add.sprite(game.config.width / 2, game.config.height / 2, 'roomBackground').setDisplaySize(game.config.width, game.config.height).setDepth(5.2);
}