var BackGround = BackGround || {}

BackGround.brainGroup = null;
BackGround.myCharacter = null;
BackGround.characterPos = [
    new Phaser.Math.Vector2(100, 99), new Phaser.Math.Vector2(248, 198), new Phaser.Math.Vector2(412, 144), new Phaser.Math.Vector2(124, 393), 
    new Phaser.Math.Vector2(368, 336), new Phaser.Math.Vector2(272, 453), new Phaser.Math.Vector2(100, 595), new Phaser.Math.Vector2(284, 678), 
    new Phaser.Math.Vector2(444, 639), new Phaser.Math.Vector2(116, 799), new Phaser.Math.Vector2(413, 789), new Phaser.Math.Vector2(280, 916), 
    new Phaser.Math.Vector2(1437, 157), new Phaser.Math.Vector2(1672, 95), new Phaser.Math.Vector2(1832, 166), new Phaser.Math.Vector2(1581, 239), 
    new Phaser.Math.Vector2(1779, 311), new Phaser.Math.Vector2(1595, 414), new Phaser.Math.Vector2(1774, 480), new Phaser.Math.Vector2(1501, 563), 
    new Phaser.Math.Vector2(1736, 655), new Phaser.Math.Vector2(1446, 770), new Phaser.Math.Vector2(1656, 894), new Phaser.Math.Vector2(1826, 819), 
]
BackGround.otherCharacters = [];

BackGround.loadImage = function(scene)
{
    scene.load.image('brainGround', 'assets/image/background/background_brain.png');
    scene.load.image('menuBackground', 'assets/placeholder/menuBackground.png');
    scene.load.image('roomBackground', 'assets/placeholder/roomBackground.png');
}

BackGround.drawCharacter = function(scene)
{
    BackGround.myCharacter = scene.add.sprite(game.config.width / 2, game.config.height * 41 / 48, 'pyeongminWrite').setScale(0.45).setDepth(2);
    BackGround.characterPos = Phaser.Utils.Array.Shuffle(BackGround.characterPos);
    RoomData.players.forEach(function(element){
        if(element.id != RoomData.myself.id)
        {
            element.position = BackGround.characterPos.pop();
            BackGround.otherCharacters.push(scene.add.sprite(element.position.x, element.position.y, 'pyeongminWrite').setScale(0.45).setDepth(1));
            BackGround.otherCharacters[BackGround.otherCharacters.length - 1].flipX = element.position.x < game.config.width / 2 ? true : false;
        }
    });
}

BackGround.drawBrain = function(scene)
{
    brains = scene.add.sprite(game.config.width / 2, game.config.height / 2, 'brainGround').setDisplaySize(game.config.width, game.config.height).setDepth(1);
}

BackGround.drawMenu = function(scene)
{
    scene.add.sprite(game.config.width / 2, game.config.height / 2, 'menuBackground').setDisplaySize(game.config.width, game.config.height).setDepth(1);
}

BackGround.drawRoom = function(scene)
{
    scene.add.sprite(game.config.width / 2, game.config.height / 2, 'roomBackground').setDisplaySize(game.config.width, game.config.height).setDepth(1);
}