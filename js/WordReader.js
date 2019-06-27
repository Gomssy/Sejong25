var WordReader = WordReader || {};

//초성의 타수를 반환함
function firstSound(charText)
{
    var r = parseInt(((charText.charCodeAt(0) - parseInt('0xac00',16)) /28) / 21);
    //쌍자음일 경우
    if(r === 1 || r === 4 || r === 8 || r === 10 || r === 13) return 1.3;
    else return 1;
}

//중성의 타수를 반환함
function middleSound(charText)
{
    var r = parseInt(((charText.charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21);
    //'ㅒ' 또는 'ㅖ'일 경우
    if(r === 3 || r === 7) return 1.3;
    //조합된 모음일 경우
    else if(r === 9 || r === 10 || r === 11 || r === 14 || r === 15 || r === 16 || r === 19) return 2;
    else return 1;
}

//종성의 타수를 반환함
function lastSound(charText)
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
        temp += parseFloat(firstSound(stringText.charAt(i))) + middleSound(stringText.charAt(i)) + lastSound(stringText.charAt(i));
    }
    return temp;
}

//입력 받은 단어의 등급을 반환함
WordReader.getWordGrade = function(_wordTyping)
{
    return 2 < _wordTyping && _wordTyping < 6 ? 3 :
    7 < _wordTyping && _wordTyping < 11 ? 2 : 
    12 < _wordTyping && _wordTyping < 16 ? 1 : 0;
}