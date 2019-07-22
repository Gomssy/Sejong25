var WordReader = WordReader || {};

WordReader.normalWeight = [3, 5, 7, 10];
WordReader.attackWeight = [6, 8, 12, 15];
WordReader.strongAttackWeight = [10, 13, 16, 20];

//초성의 타수를 반환함
WordReader.firstSound = function(charText)
{
    var r = parseInt(((charText.charCodeAt(0) - parseInt('0xac00',16)) /28) / 21);
    //쌍자음일 경우
    if(r === 1 || r === 4 || r === 8 || r === 10 || r === 13) return 1.3;
    else return 1;
}

//중성의 타수를 반환함
WordReader.middleSound = function(charText)
{
    var r = parseInt(((charText.charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21);
    //'ㅒ' 또는 'ㅖ'일 경우
    if(r === 3 || r === 7) return 1.3;
    //조합된 모음일 경우
    else if(r === 9 || r === 10 || r === 11 || r === 14 || r === 15 || r === 16 || r === 19) return 2;
    else return 1;
}

//종성의 타수를 반환함
WordReader.lastSound = function(charText)
{
    var r = parseInt((charText.charCodeAt(0) - parseInt('0xac00',16)) % 28);
    //쌍자음일 경우
    if(r === 2 || r === 20) return 1.3;
    //없을 경우
    else if(r === 0) return 0;
    //조합된 자음일 경우
    else if(r === 3 || r === 5 || r === 6 || r === 9 || r === 10 || r === 11 || r === 12 || r === 13 || r === 14 || r === 15 || r === 18) return 2;
    else return 1;
}

//입력 받은 단어의 타수를 반환함
WordReader.getWordTyping = function(stringText)
{
    var temp = 0;
    for(var i = 0; i < stringText.length; i++)
    {
        if(stringText.charCodeAt(i) < parseInt('0xac00',16) || stringText.charCodeAt(i) > parseInt('0xd7af',16)) return -1;
        temp += parseFloat(WordReader.firstSound(stringText.charAt(i))) + WordReader.middleSound(stringText.charAt(i)) + WordReader.lastSound(stringText.charAt(i));
    }
    return temp;
}

//입력 받은 단어의 등급을 반환함
WordReader.getWordGrade = function(_wordTyping)
{
    return 4 <= _wordTyping && _wordTyping < 7  ? 3 :
           7 <= _wordTyping && _wordTyping < 12 ? 2 : 
          12 <= _wordTyping && _wordTyping < 17 ? 1 :
          17 <= _wordTyping && _wordTyping < 26 ? 0 : -1;
}

WordReader.getEditDistance = function(input, check) {
    var inputWords = [], checkWords = []
    for(let i = 0; i < input.length; i++)
    {
        inputWords.push(parseInt(((input[i].charCodeAt(0) - parseInt('0xac00',16)) /28) / 21) + parseInt('0x1100',16));
        inputWords.push(parseInt(((input[i].charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21) + parseInt('0x1161',16));
        inputWords.push(parseInt((input[i].charCodeAt(0) - parseInt('0xac00',16)) % 28) + parseInt('0x11A8') -1);
    }
    for(let i = 0; i < check.length; i++)
    {
        checkWords.push(parseInt(((check[i].charCodeAt(0) - parseInt('0xac00',16)) /28) / 21) + parseInt('0x1100',16));
        checkWords.push(parseInt(((check[i].charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21) + parseInt('0x1161',16));
        checkWords.push(parseInt((check[i].charCodeAt(0) - parseInt('0xac00',16)) % 28) + parseInt('0x11A8') -1);
    }  
    var matrix = [];
    var i, j;
    for(i = 0; i <= checkWords.length; i++) // increment along the first column of each row
        matrix[i] = [i];
    for(j = 0; j <= inputWords.length; j++) // increment each column in the first row
        matrix[0][j] = j;
    for(i = 1; i <= checkWords.length; i++) // Fill in the rest of the matrix
        for(j = 1; j <= inputWords.length; j++){
            if(checkWords[i-1] == inputWords[j-1]) matrix[i][j] = matrix[i-1][j-1];
            else matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                    Math.min(matrix[i][j-1] + 1, // insertion
                                            matrix[i-1][j] + 1)); // deletion
        }
    return matrix[checkWords.length][inputWords.length];
}