var WordReader = WordReader || {};

function firstSound(charText)
{
    var r = parseInt(((charText.charCodeAt(0) - parseInt('0xac00',16)) /28) / 21);
    if(r === 1 || r === 4 || r === 8 || r === 10 || r === 13) return 1.3;
    else return 1;
}

function middleSound(charText)
{
    var r = parseInt(((charText.charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21);
    if(r === 3 || r === 7) return 1.3;
    else if(r === 9 || r === 10 || r === 11 || r === 14 || r === 15 || r === 16 || r === 19) return 2;
    else return 1;
}

function lastSound(charText)
{
    var r = parseInt((charText.charCodeAt(0) - parseInt('0xac00',16)) % 28);
    if(r === 2 || r === 20) return 1.3;
    else if(r === 0) return 0;
    else if(r === 3 || r === 5 || r === 6 || r === 9 || r === 10 || r === 11 || r === 12 || r === 13 || r === 14 || r === 15 || r === 18) return 2;
    else return 1;
}

WordReader.getWordTyping = function(stringText)
{
    var temp = 0;
    for(var i = 0; i < stringText.length; i++)
    {
        temp += parseFloat(firstSound(stringText.charAt(i))) + middleSound(stringText.charAt(i)) + lastSound(stringText.charAt(i));
    }
    return temp;
}

WordReader.getWordGrade = function(stringText)
{
    return 2 < this.wordTyping && this.wordTyping < 6 ? 3 :
    7 < this.wordTyping && this.wordTyping < 11 ? 2 : 
    12 < this.wordTyping && this.wordTyping < 16 ? 1 : 0;
}