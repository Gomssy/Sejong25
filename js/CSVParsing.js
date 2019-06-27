var grade3Array = new Array();
var grade2Array = new Array();
var grade1Array = new Array();
var grade0Array = new Array();

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