var Input = Input || {};

Input.input = [];
Input.convInput = ""; // converted input

Input.reset = function()
{
    Input.input = [];
}

Input.convert = function()
{
    // convert input to convInput
}

Input.inputField = 
{
    generate: function(scene)
    {
        this.background = scene.add.sprite(400, 500, 'inputFieldBackground').setScale(0.2);
        this.text = scene.add.text(400, 500, "안녕하세요", {font: '15pt 궁서'}).setOrigin(0.5, 0.5).setColor('#000000');
    },
    loadImage: function(scene)
    {
        scene.load.image('inputFieldBackground', 'assets/inputFieldBackground.png');
    }
}