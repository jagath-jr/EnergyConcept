const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '..', 'data');
const contentFile = path.join(dataDir, 'content.json');
const historyFile = path.join(dataDir, 'history.json');
const defaultContentFile = path.join(dataDir, 'default-content.json');

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(contentFile)) {
    const defaultContent = JSON.parse(fs.readFileSync(defaultContentFile, 'utf8'));
    fs.writeFileSync(contentFile, JSON.stringify(defaultContent, null, 2));
  }

  if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, JSON.stringify([], null, 2));
  }
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function getContent() {
  ensureDataFiles();
  return readJSON(contentFile);
}

function getHistory() {
  ensureDataFiles();
  return readJSON(historyFile).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function saveContent(newContent, meta = {}) {
  ensureDataFiles();
  const currentContent = getContent();
  const history = getHistory();

  const snapshot = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    action: meta.action || 'Updated content',
    section: meta.section || 'all',
    previousContent: currentContent
  };

  history.unshift(snapshot);

  writeJSON(contentFile, newContent);
  writeJSON(historyFile, history.slice(0, 100));

  return snapshot;
}

function undoLastChange() {
  const history = getHistory();

  if (!history.length) {
    return null;
  }

  const [latest, ...rest] = history;
  writeJSON(contentFile, latest.previousContent);
  writeJSON(historyFile, rest);

  return latest;
}

module.exports = {
  getContent,
  saveContent,
  getHistory,
  undoLastChange
};
