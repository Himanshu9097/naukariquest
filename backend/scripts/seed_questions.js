const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const Question = require('../models/Question');
require('dotenv').config({ path: __dirname + '/../.env' });

const getXlsxFiles = (dirPath, arrayOfFiles = []) => {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getXlsxFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.xlsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    await Question.deleteMany({});
    console.log('Cleared existing questions.');

    const baseDirs = [
      'C:/Users/riddh/Downloads/naurakiquest/Aptitude',
      'C:/Users/riddh/Downloads/naurakiquest/Verbal_Q'
    ];

    let allFiles = [];
    for (const d of baseDirs) {
      allFiles = allFiles.concat(getXlsxFiles(d));
    }

    // Assign categories based on folder path
    const getCategory = (filePath) => {
      const lower = filePath.toLowerCase();
      if (lower.includes('logical-reasoning')) return 'logical-reasoning';
      if (lower.includes('non-verbal')) return 'non-verbal';
      if (lower.includes('data-interpretation')) return 'data-interpretation';
      if (lower.includes('c-sharp')) return 'c-sharp';
      if (lower.includes('cpp') || lower.includes('c++')) return 'cpp';
      if (lower.includes('java')) return 'java';
      if (lower.includes('c-programming')) return 'c-programming';
      if (lower.includes('verbal-ability')) return 'verbal-ability';
      if (lower.includes('verbal-reasoning')) return 'verbal-reasoning';
      return 'aptitude'; // default
    };

    let totalInserted = 0;

    for (const file of allFiles) {
      try {
        const workbook = xlsx.readFile(file);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);
        
        const type = getCategory(file);
        const docs = [];
        for (const row of rows) {
          if (!row['Question Text'] || !row['Options'] || !row['Answer']) continue;
          
          let optionsRaw = row['Options'].toString().split(';');
          if (optionsRaw.length < 2) optionsRaw = row['Options'].toString().split('\n').filter(r => r.trim().length > 0);
          
          const options = optionsRaw.map(o => o.replace(/\n/g, '').trim()).filter(o => o.length > 0);
          if (options.length < 2) continue; // skip bad formats

          const ansLetter = row['Answer'].toString().trim().toUpperCase();
          const matchNum = ansLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          const correctIndex = (matchNum >= 0 && matchNum < options.length) ? matchNum : 0;

          docs.push({
            type: type,
            text: row['Question Text'].replace(/\n/g, ' ').trim(),
            options: options,
            correctOptionIndex: correctIndex,
            explanation: row['Explanation'] ? row['Explanation'].substring(0, 500) : ''
          });

          if (docs.length >= 250) break; // Limit per file to avoid huge memory spikes, though multiple files offset this
        }

        if (docs.length > 0) {
          await Question.insertMany(docs);
          totalInserted += docs.length;
          console.log(`+ Inserted ${docs.length} from ${path.basename(file)} [${type}]`);
        }
      } catch (e) {
        // Just skip bad files
      }
    }

    console.log(`Success! Recursively inserted ${totalInserted} total questions across all subfolders.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
