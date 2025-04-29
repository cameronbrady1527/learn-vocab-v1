// import 'papaparse';
// import * as XLSX from 'xlsx/xlsx.js';

let vocabData = [];

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
      parseCSV(data);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')){
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

const parseCSV = (data) => {
  Papa.parse(data, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      processData(results.data)
    },
    error: function(error) {
      alert('Error parsing CSV: ' + error);
    }
  });
}

const parseExcel = (data) => {
  try {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = worksheet.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    processData(jsonData);
  } catch(error) {
    alert('Error parsing Excel file: ' + error);
  }
}

const processData = (data) => {
  vocabData = data.map(item => {
    const word = {
      word: item.word || '',
      partOfSpeech: item['part of speech'] || '',
      definition: item['definition'] || '',
      sentence1: item['in a sentence (1)'] || '',
      semtence2: item['in a sentence (2)'] || '',
      synonyms: item.synonyms || '',
      timesCorrect: parseInt(item.times_correct || item.timesCorrect || 0),
      timesEncountered: parseInt(item.times_encountered || item.timesEncountered || 0),
    }
    return word;
  });

  localStorage.setItem('vocabData', JSON.stringify(vocabData));

  // Update UI
  showQuizInterface();
}

const showQuizInterface = () => {
  document.getElementById('landing-instructions').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
}