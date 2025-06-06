// state and storage variables
let vocabData = [];
let guessed = false;
let currentWord;
const fileNameEnding = "";

// behavior when page loads
window.onload = function() {
  const savedData = localStorage.getItem('vocabData');
  if (savedData) {
    showQuizInterface();
    setTimeout(() => {
      vocabData = JSON.parse(savedData);
      showNextWord();
    }, 4000)
  }
}

// functions for processing vocab data from user
const handleFileUpload = () => {
  const inputFile = document.getElementById('csv-file');
  const file = inputFile.files[0];

  if (!file) {
    alert('Please select a file');
    return
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      fileNameEnding = '.csv';
      parseCSV(data);
    } else if (fileName.endsWith('.xlsx')) {
      fileNameEnding = '.xlsx';
      parseExcel(data);
    } else {
      alert('Unsupported file format. Please upload a CSV or Excel file.')
    }
  }

  if (file.name.toLowerCase().endsWith('.csv')) {
    reader.readAsText(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
}

async function parseExcel(data) {
  const schema = {
    'Word': {
      prop: 'word',
      type: String,
      required: true
    },
    'Type': {
      prop: 'partOfSpeech',
      type: String,
      required: true
    },
    'Definition': {
      prop: 'definition',
      type: String,
      required: true
    },
    'In a sentence (1)': {
      prop: 'sentence1',
      type: String,
      required: true
    },
    'In a sentence (2)': {
      prop: 'sentence2',
      type: String,
      required: true
    },
    'Synonyms': {
      prop: 'synonyms',
      type: String,
      required: true
    },
    'Times Correct': {
      prop: 'timesCorrect',
      type: Number,
      required: true
    },
    'Times Encountered': {
      prop: 'timesEncountered',
      type: Number,
      required: true
    }
  }

  try {
    const result = await readXlsxFile(data, { schema });
    localStorage.setItem('vocabData', JSON.stringify(result.rows));
  } catch (error) {
    console.error('Error processing Excel file: ', error);
  }

  showQuizInterface();
  setTimeout(() => showNextWord(), 5000);
}

const parseCSV = (data) => {
  const requiredColumns = [
    'Word', 'Type', 'Definition',
    'In a sentence (1)', 'In a sentence(2)',
    'Synonyms', 'Times Correct', 'Times Encountered'
  ];
  
  const parsed = Papa.parse(data, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    complete: function(results) {
      const headers = results.meta.fields;
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));

      if (missingColumns.length > 0) {
        alert(`Missing required columns: ${missingColumns.join(', ')}. Please adjust!`);
        return;
      }
    }
  }); 

  if (parsed.errors.length > 0) {
    console.error('CSV parsing errors: ', parsed.errors);
    alert('Error parsing CSV file. Please check the file format or use an Excel file.');
    return;
  }

  const transformedData = parsed.data.map(row => {
    return {
      word: row['Word'] || '',
      partOfSpeech: row['Type'] || '',
      definition: row['Definition'] || '',
      sentence1: row['In a sentence (1)'] || '',
      sentence2: row['In a sentence (2)'] || '',
      synonyms: row['Synonyms'] || '',
      timesCorrect: parseInt(row['Times Correct']) || 0,
      timesEncountered: parseInt(row['Times Encountered']) || 0
    };
  });

  const validData = transformedData.filter(item => item.word && item.word.trim() !== '');

  if (validData.length === 0) {
    alert('No valid vocabulary data found in the CSV file. Check your schema and rows or migrate to an Excel file.');
    return;
  }

  vocabData = validData;
  localStorage.setItem('vocabData', JSON.stringify(vocabData));

  showQuizInterface();
  setTimeout(() => showNextWord(), 5000);
}

 // logic for moving onto next word
const showNextWord = () => {
  const index = generateRandomIndex(vocabData.length);
  let word = vocabData[index];
  guessed = false;
  currentWord = word;

  hideInfo();
  clearTextArea();

  document.getElementById('current-word').textContent = word.word;
  document.getElementById('word').textContent = word.word;
  document.getElementById('part-of-speech').textContent = `Part of Speech: ${word.partOfSpeech}`;
  document.getElementById('definition').firstElementChild.textContent = word.definition;
  
  // parse definitions string and insert definitions into DOM
  const definitionList = parseDefinitions(word.definition);
  const olDefinitions = document.getElementById('definition');
  clearOL(olDefinitions);
  definitionList.forEach(definition => olDefinitions.appendChild(definition));
  
  // parse synonyms string and insert synonyms into DOM
  const synonymsList = parseSynonyms(word.synonyms);
  const ulSynonyms = document.getElementById('synonyms');
  clearUL(ulSynonyms);
  synonymsList.forEach(synonym => ulSynonyms.appendChild(synonym));

  document.getElementById('sentence1').textContent = word.sentence1; // TODO: look for word and bold it
  document.getElementById('sentence2').textContent = word.sentence2; // TODO: look for word and bold it

  if(word.timesEncountered) {
    // report score and letter grade
    computeFlashcardStats(word.timesCorrect, word.timesEncountered);
  } else {
    document.getElementById('word-score').textContent = "";
    document.getElementById('letter-grade').textContent = "";
  }

  word = currentWord;
}

const exportToExcel = () => {
  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(vocabData);

  XLSX.utils.book_append_sheet(wb, ws, "Vocab Data")

  // TODO: ADD IN ANOTHER SHEET THAT HAS SCORE STATISTICS

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }

    return buf;
  }

  createBlob(s2ab(wbout), 'application/octet-stream', 'data.xlsx');
}

const exportToCSV = () => {
  const headers = Object.keys(vocabData[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row  => headers.map(header => {
      const value = row[header];

      return typeof value === 'string' && value.includes(',')
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    }).join(','))
  ].join('\n');

  createBlob(csvContent, 'text/csv', 'data.csv')
}

// Utility functions
const clearUL = (ul) => {
  while(ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
}

const clearOL = (ol) => {
  while(ol.firstChild) {
    ol.removeChild(ol.firstChild);
  }
}

const parseSynonyms = (synonymsString) => {
  const splitSynonyms = synonymsString.split('; ');
  const synonymsList = splitSynonyms.map((synonym) => createLI(synonym));
  
  return synonymsList;
}

const parseDefinitions = (definitionsString) => {
  const splitDefinitions = definitionsString.split(';');
  const definitionsList = splitDefinitions.map((definition) => createLI(definition));

  return definitionsList;
}

const createLI = (s) => {
  const li = document.createElement('li');
  li.textContent = s;
  return li;
}

const calculateAverage = (correct, encountered) => {
  const averageDecimal = correct / encountered * 100;
  const average = averageDecimal.toFixed(1);

  if (average == 100) return Math.floor(average);

  return average;
}

const reportLetterGrade = (average) => {
  let letter = '';

  if(average === 100) letter = 'A+';
  else if (average >= 90) letter = 'A';
  else if (average >= 80) letter = 'B';
  else if (average >= 70) letter = 'C';
  else if (average >= 60) letter = 'D';
  else letter = 'F';

  return letter;
}

const computeFlashcardStats = (correct, encountered) => {
  const average = calculateAverage(correct, encountered);
  const letter = reportLetterGrade(average);

  reportWordGrades(currentWord.timesCorrect, currentWord.timesEncountered, average, letter);
}

const reportWordGrades = (correct, encountered, average, letter) => {
  document.getElementById('word-score').textContent = `${correct} / ${encountered} = ${average}%`;
  document.getElementById('letter-grade').textContent = letter;
}

const gotCorrect = () => {
  if (guessed) return;

  guessed = true;
  currentWord.timesCorrect += 1;
  currentWord.timesEncountered += 1;

  computeFlashcardStats(currentWord.timesCorrect, currentWord.timesEncountered);
  saveState();
}

const gotIncorrect = () => {
  if (guessed) return;

  guessed = true;
  currentWord.timesEncountered += 1;

  computeFlashcardStats(currentWord.timesCorrect, currentWord.timesEncountered);
  saveState();
}

const showQuizInterface = () => {
  document.getElementById('landing-instructions').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
}

const showInfo = () => document.getElementById('guessed').style.display = 'block';
const hideInfo = () => document.getElementById('guessed').style.display = 'none';
const clearTextArea = () => document.getElementById('sentence-practice').value = "";

const generateRandomIndex = (wordCount) => Math.floor(Math.random() * wordCount);

const saveState = () => localStorage.setItem('vocabData', JSON.stringify(vocabData));

const exportToProperEnding = () => (fileNameEnding === '.xlsx') ? exportToExcel() : exportToCSV();

const createBlob = (blobPart, blobType, filename) => {
  const blob = new Blob([blobPart], { type: blobType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}