import { mkdirSync, rmSync, statSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const SOURCE_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json';
const OUTPUT_DIR = 'assets/db';
const OUTPUT_FILE = `${OUTPUT_DIR}/words.db`;
const VALID_WORD = /^[a-z]+$/;

async function fetchWords() {
  const response = await fetch(SOURCE_URL);

  if (!response.ok) {
    throw new Error(`Falha ao baixar a lista de palavras: HTTP ${response.status}`);
  }

  const dictionary = await response.json();

  return Object.keys(dictionary)
    .filter((word) => VALID_WORD.test(word))
    .sort();
}

function buildDatabase(words) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  rmSync(OUTPUT_FILE, { force: true });

  const db = new DatabaseSync(OUTPUT_FILE);

  db.exec('CREATE TABLE words (word TEXT PRIMARY KEY NOT NULL) WITHOUT ROWID;');

  const insert = db.prepare('INSERT INTO words (word) VALUES (?)');

  db.exec('BEGIN');
  for (const word of words) {
    insert.run(word);
  }
  db.exec('COMMIT');

  db.exec('VACUUM');
  db.close();
}

const words = await fetchWords();
buildDatabase(words);

const sizeInMb = (statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1);
console.log(`✔ ${words.length} palavras gravadas em ${OUTPUT_FILE} (${sizeInMb} MB)`);
