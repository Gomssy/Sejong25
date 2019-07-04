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
    scene: [ gameScene ]
};

var game = new Phaser.Game(config)
var playerNum = -1;

// client side
var socket = io.connect();
socket.emit('idRequest');
socket.on('idSet', function(msg) // {str, num}
{
    console.log(msg.str);
    this.playerNum = msg.num;
});