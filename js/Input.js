var Input = Input || {};

Input.input = [];
Input.convInput = ""; // converted input

Input.isShifted = false;

Input.reset = function()
{
    Input.input = [];
    Input.convInput = [];
    Input.inputField.text.setText(Input.convInput);
    console.log(Input.input);
}

// convert input to convInput
Input.convert = function()
{
    // input -> krInput with vowels
    let krInput = "";
    let vowels = [];
    for (let i = 0; i < this.input.length; i++)
    {
        // 쌍자음, Shift쓰는 모음 체크
        if (this.input[i] < 0)
        {
            console.log(-1 * this.input[i]);
            switch(String.fromCharCode(-1 * this.input[i]))
            {
                case 'ㅂ': krInput += 'ㅃ'; break;
                case 'ㅈ': krInput += 'ㅉ'; break;
                case 'ㄷ': krInput += 'ㄸ'; break;
                case 'ㄱ': krInput += 'ㄲ'; break;
                case 'ㅅ': krInput += 'ㅆ'; break;
                case 'ㅐ': krInput += 'ㅒ'; vowels.push(krInput.length - 1); break;
                case 'ㅔ': krInput += 'ㅖ'; vowels.push(krInput.length - 1); break;
                default: console.log("[ERR] 이상한 단어가 쌍자음으로 들어옴."); break;
            }
        }
        // 모음쌍 체크
        else if (this.input[i] >= 'ㅏ'.charCodeAt(0) && this.input[i + 1] >= 'ㅏ'.charCodeAt(0)) 
        {
            switch (String.fromCharCode(this.input[i]) | String.fromCharCode(this.input[i + 1]))
            {
                case 'ㅗ' | 'ㅏ': krInput += 'ㅘ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅗ' | 'ㅐ': krInput += 'ㅙ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅗ' | 'ㅣ': krInput += 'ㅚ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅜ' | 'ㅓ': krInput += 'ㅝ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅜ' | 'ㅔ': krInput += 'ㅞ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅜ' | 'ㅣ': krInput += 'ㅟ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅡ' | 'ㅣ': krInput += 'ㅢ'; vowels.push(krInput.length - 1); i++; break;
                default: break; // 모음쌍을 만들지 못함.
            }
        }
        // 나머지 자음 및 남는 모음들
        else
        {
            krInput += String.fromCharCode(this.input[i]);
            if (this.input[i] >= 'ㅏ'.charCodeAt(0)) vowels.push(krInput.length - 1); // 모음일 경우
        }
    }
    this.convInput = krInput;
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
                Input.convert();
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
        scene.input.keyboard.on('keydown-Q', function() {Input.pushInput('ㅂ')});
        scene.input.keyboard.on('keydown-W', function() {Input.pushInput('ㅈ')});
        scene.input.keyboard.on('keydown-E', function() {Input.pushInput('ㄷ')});
        scene.input.keyboard.on('keydown-R', function() {Input.pushInput('ㄱ')});
        scene.input.keyboard.on('keydown-T', function() {Input.pushInput('ㅅ')});
        scene.input.keyboard.on('keydown-Y', function() {Input.pushInput('ㅛ')});
        scene.input.keyboard.on('keydown-U', function() {Input.pushInput('ㅕ')});
        scene.input.keyboard.on('keydown-I', function() {Input.pushInput('ㅑ')});
        scene.input.keyboard.on('keydown-O', function() {Input.pushInput('ㅐ')});
        scene.input.keyboard.on('keydown-P', function() {Input.pushInput('ㅔ')});
        // middleside 9 keys
        scene.input.keyboard.on('keydown-A', function() {Input.pushInput('ㅁ')});
        scene.input.keyboard.on('keydown-S', function() {Input.pushInput('ㄴ')});
        scene.input.keyboard.on('keydown-D', function() {Input.pushInput('ㅇ')});
        scene.input.keyboard.on('keydown-F', function() {Input.pushInput('ㄹ')});
        scene.input.keyboard.on('keydown-G', function() {Input.pushInput('ㅎ')});
        scene.input.keyboard.on('keydown-H', function() {Input.pushInput('ㅗ')});
        scene.input.keyboard.on('keydown-J', function() {Input.pushInput('ㅓ')});
        scene.input.keyboard.on('keydown-K', function() {Input.pushInput('ㅏ')});
        scene.input.keyboard.on('keydown-L', function() {Input.pushInput('ㅣ')});
        // downside 7 keys
        scene.input.keyboard.on('keydown-Z', function() {Input.pushInput('ㅋ')});
        scene.input.keyboard.on('keydown-X', function() {Input.pushInput('ㅌ')});
        scene.input.keyboard.on('keydown-C', function() {Input.pushInput('ㅊ')});
        scene.input.keyboard.on('keydown-V', function() {Input.pushInput('ㅍ')});
        scene.input.keyboard.on('keydown-B', function() {Input.pushInput('ㅠ')});
        scene.input.keyboard.on('keydown-N', function() {Input.pushInput('ㅜ')});
        scene.input.keyboard.on('keydown-M', function() {Input.pushInput('ㅡ')});
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
            case 'ㅂ': output = -1 * 'ㅂ'.charCodeAt(0); break;
            case 'ㅈ': output = -1 * 'ㅈ'.charCodeAt(0); break;
            case 'ㄷ': output = -1 * 'ㄷ'.charCodeAt(0); break;
            case 'ㄱ': output = -1 * 'ㄱ'.charCodeAt(0); break;
            case 'ㅅ': output = -1 * 'ㅅ'.charCodeAt(0); break;
            case 'ㅐ': output = -1 * 'ㅐ'.charCodeAt(0); break;
            case 'ㅔ': output = -1 * 'ㅔ'.charCodeAt(0); break;
            default: output = inputKey.charCodeAt(0); break;
        }
    }
    else output = inputKey.charCodeAt(0);
    Input.input.push(output);
    console.log(Input.input);
    Input.convert();
    Input.inputField.text.setText(Input.convInput);
}