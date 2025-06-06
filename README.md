# Vocabulary Tracker

A web-based application for learning vocabulary words with personalized tracking and statistics.

## Overview

Vocabulary Tracker is an interactive learning tool that helps you master new vocabulary words by providing a flashcard-like interface with performance tracking for each individual word. The application enables you to:

- Upload your existing vocabulary spreadsheet
- Test yourself on definitions and track your progress
- Get personalized statistics for each word
- Focus more on words you struggle with (coming soon!)
- Export your progress data back to Excel format

## Features

### Data Management
- **Import Existing Data**: Upload a vocabulary Excel file, following a schematic defined below
- **Persistent Storage**: All progress is automatically saved in your browser
- **Export Progress**: Download your vocabulary list with updated statistics in an Excel file `data.xlsx`

### Learning Interface
- **Interactive Flashcards**: Simple and intuitive card-based learning
- **Reveal Controls**: Test your knowledge before revealing answers
- **Self-Assessment**: Mark your answers as correct or incorrect
- **Word Stats**: See your success rate for each individual word

### Smart Learning (coming soon!)
- **Prioritized Words**: Algorithm favors words with lower success rates
- **Performance Tracking**: Both session and overall statistics
- **Visual Progress**: Progress bar shows your improvement
- **Detailed Analytics**: Complete table of word-level performance

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge, Brave)
- Vocabulary data in Excel or CSV (coming soon!) format

### Required Data Format
Your vocabulary spreadsheet should include these columns (in this order):
1. `word` - The vocabulary word
2. `part of speech` - Noun, verb, adjective, etc.
3. `in a sentence (1)` - First example sentence
4. `in a sentence (2)` - Second example sentence
5. `synonyms` - Related words

The app will automatically add:
- `times_correct` - Number of times you got the word right
- `times_encountered` - Total number of times you've seen the word

### How to Use

1. Open the application in your web browser
2. Click "Choose File" and select your vocabulary Excel file
3. Click "Load Vocab" to import your data
4. A word will be displayed - try to recall its definition
5. Click "Reveal Definition" to check your answer
6. Mark your answer as "Yes :)" or "I will next time?" under the "Did you get it?" question
7. Continue through your vocabulary list by pressing "Next Card"
8. Click "Save Progress" at any time to save your progress to an exported Excel file (reminder: your progress is saved in the local browser)

## Data Persistence

The application saves all of your progress data in your browser's localStorage. This means:

- Your data persists even if you close the browser or refresh the page
- Data is stored locally on your device in your browser, not on any external server, so you can run the program offline!
- You can export your data at any time to back it up
- To use across multiple devices, export your data and import it on the other device

## Customization

The application is designed to work with the specific column format described above. If your data uses different column names, you'll need to rename them to match this format before importing.

## Technical Details

Vocabulary Tracker is built using:
- HTML5, CSS3, and JavaScript
- PapaParse for CSV parsing (coming soon!)
- SheetJS for Excel file support
- Browser localStorage for data persistence

No server or internet connection is required after the initial page load.

## Privacy

The application processes all data locally in your browser. Your vocabulary data and learning statistics are never uploaded to any server.

## License

This project is released under the MIT License.

---

## Future Enhancements

Potential features for future versions:
- Spaced repetition algorithm
- Multiple vocabulary lists
- Custom categories and tagging
- Definition entry mode
- Audio pronunciation
- Mobile app version