// let vocabData = [];

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

  // Update UI
  showQuizInterface();
}

const showQuizInterface = () => {
  document.getElementById('landing-instructions').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
}

const showInfo = () => document.getElementById('guessed').style.display = 'block';
const hideInfo = () => document.getElementById('guessed').style.display = 'none';
