// state and storage variables
let vocabData = [];
let guessed = false;
let currentWord;

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
      // parseCSV(data); // not yet implemented
    } else if (fileName.endsWith('.xlsx')) {
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

 // logic for moving onto next word
const showNextWord = () => {
  guessed = false;

  const index = generateRandomIndex(vocabData.length);
  const word = vocabData[index];

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
}

const gotIncorrect = () => {
  if (guessed) return;

  guessed = true;
  currentWord.timesEncountered += 1;

  computeFlashcardStats(currentWord.timesCorrect, currentWord.timesEncountered);
}

const showQuizInterface = () => {
  document.getElementById('landing-instructions').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
}

const showInfo = () => document.getElementById('guessed').style.display = 'block';
const hideInfo = () => document.getElementById('guessed').style.display = 'none';
const clearTextArea = () => document.getElementById('sentence-practice').value = "";

const generateRandomIndex = (wordCount) => Math.floor(Math.random() * wordCount);
