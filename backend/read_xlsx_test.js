const xlsx = require('xlsx');

const workbook = xlsx.readFile('C:/Users/riddh/Downloads/naurakiquest/Aptitude/aptitude.xlsx');
const sheet_name_list = workbook.SheetNames;
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

console.log(JSON.stringify(data.slice(0, 3), null, 2));
