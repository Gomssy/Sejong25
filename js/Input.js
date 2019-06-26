var Input = Input || {};

Input.input = [];
Input.convInput = ""; // converted input

Input.isShifted = false;

Input.reset = function()
{
    Input.input = [];
    Input.inputField.text.setText(Input.convInput);
    console.log(Input.input)
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

        scene.input.keyboard.on('keydown-SHIFT', function() {Input.isShifted = true});
        scene.input.keyboard.on('keyup-SHIFT', function() {Input.isShifted = false});
        scene.input.keyboard.on('keydown-DELETE', function() {Input.reset()});
        scene.input.keyboard.on('keydown-BACKSPACE', function()
        {
            if (Input.input.length > 0)
            {
                Input.input.pop(); 
                Input.inputField.text.setText(Input.convInput);
                console.log(Input.input);
            }
        });
        scene.input.keyboard.on('keydown-ENTER', function()
        {
            Input.reset();
            // do something
        });
        // upside 10 keys
        scene.input.keyboard.on('keydown-Q', function() {Input.pushInput('Q')});
        scene.input.keyboard.on('keydown-W', function() {Input.pushInput('W')});
        scene.input.keyboard.on('keydown-E', function() {Input.pushInput('E')});
        scene.input.keyboard.on('keydown-R', function() {Input.pushInput('R')});
        scene.input.keyboard.on('keydown-T', function() {Input.pushInput('T')});
        scene.input.keyboard.on('keydown-Y', function() {Input.pushInput('Y')});
        scene.input.keyboard.on('keydown-U', function() {Input.pushInput('U')});
        scene.input.keyboard.on('keydown-I', function() {Input.pushInput('I')});
        scene.input.keyboard.on('keydown-O', function() {Input.pushInput('O')});
        scene.input.keyboard.on('keydown-P', function() {Input.pushInput('P')});
        // middleside 9 keys
        scene.input.keyboard.on('keydown-A', function() {Input.pushInput('A')});
        scene.input.keyboard.on('keydown-S', function() {Input.pushInput('S')});
        scene.input.keyboard.on('keydown-D', function() {Input.pushInput('D')});
        scene.input.keyboard.on('keydown-F', function() {Input.pushInput('F')});
        scene.input.keyboard.on('keydown-G', function() {Input.pushInput('G')});
        scene.input.keyboard.on('keydown-H', function() {Input.pushInput('H')});
        scene.input.keyboard.on('keydown-J', function() {Input.pushInput('J')});
        scene.input.keyboard.on('keydown-K', function() {Input.pushInput('K')});
        scene.input.keyboard.on('keydown-L', function() {Input.pushInput('L')});
        // downside 7 keys
        scene.input.keyboard.on('keydown-Z', function() {Input.pushInput('Z')});
        scene.input.keyboard.on('keydown-X', function() {Input.pushInput('X')});
        scene.input.keyboard.on('keydown-C', function() {Input.pushInput('C')});
        scene.input.keyboard.on('keydown-V', function() {Input.pushInput('V')});
        scene.input.keyboard.on('keydown-B', function() {Input.pushInput('B')});
        scene.input.keyboard.on('keydown-N', function() {Input.pushInput('N')});
        scene.input.keyboard.on('keydown-M', function() {Input.pushInput('M')});
    },
    loadImage: function(scene)
    {
        scene.load.image('inputFieldBackground', 'assets/inputFieldBackground.png');
    }
}

Input.pushInput = function(inputKey)
{
    let output;
    if (Input.isShifted)
    {
        switch(inputKey)
        {
            case 'Q': output = -1 * 'Q'.charCodeAt(0); break;
            case 'W': output = -1 * 'W'.charCodeAt(0); break;
            case 'E': output = -1 * 'E'.charCodeAt(0); break;
            case 'R': output = -1 * 'R'.charCodeAt(0); break;
            case 'T': output = -1 * 'T'.charCodeAt(0); break;
            case 'O': output = -1 * 'O'.charCodeAt(0); break;
            case 'P': output = -1 * 'P'.charCodeAt(0); break;
            default: output = inputKey.charCodeAt(0); break;
        }
    }
    else output = inputKey.charCodeAt(0);
    Input.input.push(output);
    console.log(Input.input);
    Input.inputField.text.setText(Input.convInput);
}