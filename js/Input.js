var Input = Input || {};

Input.input = [];
Input.converted = '';
Input.convInput = ''; // converted input
Input.finalInput = '';
Input.lastSuccess = '';

Input.isShifted = false;
Input.isEntered = false;
Input.pressCount = 0;
Input.justPressed = '';
Input.maxInput = 6;

Input.attackMode = false;
Input.attackOption = {
    wordCount: 0,
    wordGrade: 0,
    isHeavy: false,
    isDark: false
};

Input.gameSceneEnterReaction = function()
{
    if (RoomData.myself.isAlive && !Input.isEntered)
    {
        if (Input.attackMode)
        {
            WordSpace.attack(Input.removeConVow(Input.finalInput), Input.attackOption.wordGrade);
            Input.inputField.inputBackground.setFrame(4);
        }
        else WordSpace.findWord(Input.finalInput);
        Input.reset();
        Input.isEntered = true;
    }
}

Input.reset = function()
{
    Input.input = [];
    Input.converted = '';
    Input.convInput = '';
    Input.finalInput = '';
    Input.inputField.text.setText(Input.finalInput);
}

// convert input to finalInput
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
            //console.log(-1 * this.input[i]);
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
            switch (String.fromCharCode(this.input[i]) + String.fromCharCode(this.input[i + 1]))
            {
                case 'ㅗㅏ': krInput += 'ㅘ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅗㅐ': krInput += 'ㅙ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅗㅣ': krInput += 'ㅚ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅜㅓ': krInput += 'ㅝ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅜㅔ': krInput += 'ㅞ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅜㅣ': krInput += 'ㅟ'; vowels.push(krInput.length - 1); i++; break;
                case 'ㅡㅣ': krInput += 'ㅢ'; vowels.push(krInput.length - 1); i++; break;
                default: krInput += String.fromCharCode(this.input[i]); vowels.push(krInput.length - 1); break; // 모음쌍을 만들지 못함.
            }
        }
        // 나머지 자음 및 남는 모음들
        else
        {
            krInput += String.fromCharCode(this.input[i]);
            if (this.input[i] >= 'ㅏ'.charCodeAt(0)) vowels.push(krInput.length - 1); // 모음일 경우
        }
    }
    if (vowels.length > 6) return false;
    //console.log(vowels);
    //console.log(krInput);

    this.convInput = '';
    let vowelIdx = 0;
    if (vowelIdx === vowels.length) this.convInput = krInput; // 모음이 없을때
    else // 모음이 존재할때
    {
        for (let i = 0; i <= vowels[vowelIdx] - 2; i++) this.convInput += krInput[i];
        while (vowelIdx < vowels.length)
        {
            if (vowels[vowelIdx] - 1 < 0 || krInput[vowels[vowelIdx] - 1].charCodeAt(0) >= 'ㅏ'.charCodeAt(0)) // 모음 앞이 비거나 모음이 있을때
            {
                if (vowelIdx + 1 < vowels.length) // 다음 모음이 있을때
                {
                    this.convInput += krInput[vowels[vowelIdx]];
                    for (let i = vowels[vowelIdx] + 1; i <= vowels[vowelIdx + 1] - 2; ++i) this.convInput += krInput[i];
                    ++vowelIdx;
                }
                else // 다음 모음이 없을때
                {
                    this.convInput += krInput[vowels[vowelIdx]];
                    for (let i = vowels[vowelIdx] + 1; i < krInput.length; i++) this.convInput += krInput[i];
                    ++vowelIdx;
                }
            }
            else // 모음 앞에 자음이 있을때
            {
                var first = this.convertToFirst(krInput[vowels[vowelIdx] - 1]);
                var middle = krInput[vowels[vowelIdx]];
                var last = 0;
                if (vowelIdx + 1 >= vowels.length) // 다음 모음이 없을때
                {
                    if (vowels[vowelIdx] + 1 < krInput.length) // 다음 자음이 존재할 때
                    {
                        if (vowels[vowelIdx] + 2 < krInput.length) // 다다음 자음이 존재할때
                        {
                            var combLast = this.combineLast(krInput[vowels[vowelIdx] + 1], krInput[vowels[vowelIdx] + 2]);
                            if (combLast != null) // 뒤의 두 자음을 합칠수 있을 때
                            {
                                last = combLast;
                                this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                                for (var i = vowels[vowelIdx] + 3; i < krInput.length; i++) this.convInput += krInput[i];
                                ++vowelIdx;
                            }
                            else // 뒤의 두 자음을 합칠수 없을때
                            {
                                last = this.convertToLast(krInput[vowels[vowelIdx] + 1]);
                                this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                                for (var i = vowels[vowelIdx] + 2; i < krInput.length; i++) this.convInput += krInput[i];
                                ++vowelIdx;
                            }
                        }
                        else // 다다음 자음이 없을때
                        {
                            last = this.convertToLast(krInput[vowels[vowelIdx] + 1]);
                            this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                            ++vowelIdx;
                        }
                    }
                    else // 다음 글자가 없을때
                    {
                        this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                        ++vowelIdx;
                    }
                }
                else // 다음 모음이 있을때
                {
                    if (vowels[vowelIdx + 1] - vowels[vowelIdx] <= 2) // 다음 모음 사이에 자음이 0개거나 1개
                    {
                        this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                        ++vowelIdx;
                    }
                    else if (vowels[vowelIdx + 1] - vowels[vowelIdx] === 3) // 다음 모음 사이에 자음이 2개
                    {
                        last = this.convertToLast(krInput[vowels[vowelIdx] + 1]);
                        this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                        ++vowelIdx;
                    }
                    else // 다음 모음 사이에 자음이 3개 이상
                    {
                        var combLast = this.combineLast(krInput[vowels[vowelIdx] + 1], krInput[vowels[vowelIdx] + 2]);
                        if (combLast != null) // 뒤의 두 자음을 합칠수 있을 때
                        {
                            last = combLast;
                            this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                            for (var i = vowels[vowelIdx] + 3; i < vowels[vowelIdx + 1] - 1; i++) this.convInput += krInput[i];
                            ++vowelIdx;
                        }
                        else // 뒤의 두 자음을 합칠수 없을때
                        {
                            last = this.convertToLast(krInput[vowels[vowelIdx] + 1]);
                            this.convInput += String.fromCharCode(this.convertToCharCode(first, middle, last));
                            for (var i = vowels[vowelIdx] + 2; i < vowels[vowelIdx + 1] - 1; i++) this.convInput += krInput[i];
                            ++vowelIdx;
                        }   
                    }
                }
            }
        }
    }
    if (this.convInput.length > 1)
    {
        if (this.convInput[1].charCodeAt(0) >= '가'.charCodeAt(0)) Input.input.splice(0, this.input.length - 2);
        else Input.input.splice(0, this.input.length - 1);
        this.converted += this.convInput.slice(0, 1);
        this.convInput = this.convInput.slice(1, 2);
    }
    Input.finalInput = Input.converted + Input.convInput;
    if (Input.finalInput.length > 6) return false;
    else 
    {
        this.lastSuccess = this.finalInput;
        return true;
    }
    //console.log('_____end_convert_____');    
}

Input.convertToLast = function(word)
{
    let output = 0;
    switch(word)
    {
        case 'ㄱ': output = 1; break;
        case 'ㄲ': output = 2; break;
        case 'ㄴ': output = 4; break;
        case 'ㄷ': output = 7; break;
        case 'ㄹ': output = 8; break;
        case 'ㅁ': output = 16; break;
        case 'ㅂ': output = 17; break;
        case 'ㅅ': output = 19; break;
        case 'ㅆ': output = 20; break;
        case 'ㅇ': output = 21; break;
        case 'ㅈ': output = 22; break;
        case 'ㅊ': output = 23; break;
        case 'ㅋ': output = 24; break;
        case 'ㅌ': output = 25; break;
        case 'ㅍ': output = 26; break;
        case 'ㅎ': output = 27; break;
        default: break;
    }
    return output;
}

Input.convertToCharCode = function(first, middle, last)
{
    // 'last' and 'first' must be code of last words
    return 0xac00 + 28 * 21 * first + 28 * (middle.charCodeAt(0) - 'ㅏ'.charCodeAt(0)) + last;
}

Input.combineLast = function(left, right)
{
    if (right.charCodeAt(0) <= 'ㅎ'.charCodeAt(0))
    {
        let output = null;
        switch(left + ',' + right)
        {
            case 'ㄱ,ㅅ': output = 3; break;
            case 'ㄴ,ㅈ': output = 5; break;
            case 'ㄴ,ㅎ': output = 6; break;
            case 'ㄹ,ㄱ': output = 9; break;
            case 'ㄹ,ㅁ': output = 10; break;
            case 'ㄹ,ㅂ': output = 11; break;
            case 'ㄹ,ㅅ': output = 12; break;
            case 'ㄹ,ㅌ': output = 13; break;
            case 'ㄹ,ㅍ': output = 14; break;
            case 'ㄹ,ㅎ': output = 15; break;
            case 'ㅂ,ㅅ': output = 18; break;
            default: break;
        }
        return output;
    }
    else return null;
}

// 나중에 바꿀 계획 있음
Input.convertToFirst = function(word)
{
    let output = 0;
    switch(word)
    {
        case 'ㄱ': output = 0; break;
        case 'ㄲ': output = 1; break;
        case 'ㄴ': output = 2; break;
        case 'ㄷ': output = 3; break;
        case 'ㄸ': output = 4; break;
        case 'ㄹ': output = 5; break;
        case 'ㅁ': output = 6; break;
        case 'ㅂ': output = 7; break;
        case 'ㅃ': output = 8; break;
        case 'ㅅ': output = 9; break;
        case 'ㅆ': output = 10; break;
        case 'ㅇ': output = 11; break;
        case 'ㅈ': output = 12; break;
        case 'ㅉ': output = 13; break;
        case 'ㅊ': output = 14; break;
        case 'ㅋ': output = 15; break;
        case 'ㅌ': output = 16; break;
        case 'ㅍ': output = 17; break;
        case 'ㅎ': output = 18; break;
        default: break;
    }
    return output;
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
    generate: function(scene, enterCallback, text)
    {
        this.text = text.getElement('text');
        this.inputBackground = text.getElement('background');

        if(ScenesData.currentScene == ScenesData.gameScene) Input.inputField.inputBackground.setFrame(4);

        scene.input.keyboard.on('keydown', function() {
            if(ScenesData.currentScene == ScenesData.hopaeScene && Input.finalInput.length > 1) Input.inputField.inputBackground.setFrame(Input.finalInput.length - 2);
        })

        scene.input.keyboard.on('keyup', function() {Input.pressCount--; Input.justPressed = '';
            if(ScenesData.currentScene == ScenesData.hopaeScene)
            {
                ScenesData.hopaeScene.checkBtn.setEnable(Input.checkProperInput(Input.inputField.text.text) && (Input.finalInput.length > 1) ? true : false);
                ScenesData.hopaeScene.warningText.setVisible(WordReader.getWordTyping(Input.finalInput) > 9 ? true : false);
            }
        })
        scene.input.keyboard.on('keydown-SHIFT', function() {Input.isShifted = true});
        scene.input.keyboard.on('keyup-SHIFT', function() {Input.isShifted = false});
        scene.input.keyboard.on('keydown-DELETE', function() {Input.reset()});
        scene.input.keyboard.on('keydown-BACKSPACE', function()
        {
            if (Input.input.length > 0)
            {
                Input.input.pop();
                Input.convert();
                Input.inputField.text.setText(Input.finalInput);
            }
            else if (Input.converted.length > 0)
            {
                Input.converted = Input.converted.slice(0, Input.converted.length - 1);
                Input.finalInput = Input.converted + Input.convInput;
                Input.inputField.text.setText(Input.finalInput);
            }
            else Input.reset();
        });
        scene.input.keyboard.on('keydown-ENTER', enterCallback);
        scene.input.keyboard.on('keyup-ENTER', function(){Input.isEntered = false;})
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
    }
}

Input.pushInput = function(inputKey)
{
    if ((ScenesData.currentScene != ScenesData.gameScene || RoomData.myself.isAlive) && this.justPressed != inputKey)
    {
        this.justPressed = inputKey;
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
        if (this.finalInput.length <= this.maxInput) this.input.push(output);
        //console.log(Input.input);
        if (!this.convert() || this.finalInput.length > this.maxInput) 
        {
            this.converted = this.lastSuccess;
            this.finalInput = this.lastSuccess;
            this.convInput = '';
            this.input = [];
            this.convert();
        }
        this.inputField.text.setText(Input.finalInput);
    }
}