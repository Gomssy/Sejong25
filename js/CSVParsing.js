var grade3Array = grade3Array || {};
var grade2Array = grade2Array || {};
var grade1Array = grade1Array || {};
var grade0Array = grade0Array || {};

function CSVParse($data) {
    var allRows = $data.split('\n')
    for(var singleRow = 0; singleRow < allRows.length; singleRow++)
    {
        var typing;
        var grade;
        typing = WordReader.getWordTyping(allRows[singleRow]);
        grade = WordReader.getWordGrade(typing);

        if(grade==3) {
            grade3Array.push(allRows[singleRow]);
        } else if(grade==2) {
            grade2Array.push(allRows[singleRow]);
        } else if(grade==1) {
            grade1Array.push(allRows[singleRow]);
        } else {
            grade0Array.push(allRows[singleRow]);
        }
    }
}