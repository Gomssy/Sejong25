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

Input.isEqual = function(inputWord, wordText) { return inputWord === wordText; }

Input.checkProperInput = function(inputWord) { return inputWord === this.removeConVow(inputWord); }

Input.removeConVow = function(_wordText)
{
    var tempStr = _wordText;
    for(var i = 0; i < _wordText.length; i++)
    {
        var tempCharCode = _wordText.charCodeAt(i);
        if(tempCharCode < 44032 || tempCharCode > 55203)
            tempStr = tempStr.replace(String.fromCharCode(parseInt(tempCharCode.toString(16), 16)), '');
    }
    return tempStr;
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