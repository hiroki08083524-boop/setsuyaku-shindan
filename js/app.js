// 共通スクリプト：データ読み込み・回答の永続化・ヘルパー

const STORAGE_KEY = 'setsuyaku_answers';
const DATA_BASE = 'data';

async function loadJSON(path) {
  const res = await fetch(`${DATA_BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function loadQuestions() {
  const data = await loadJSON('questions.json');
  return data.questions;
}

async function loadTypes() {
  const data = await loadJSON('types.json');
  return data.types;
}

async function loadAffiliates() {
  const data = await loadJSON('affiliates.json');
  return data.affiliates;
}

function saveAnswers(answers) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

function loadAnswers() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function clearAnswers() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function getResultType() {
  const raw = sessionStorage.getItem('setsuyaku_result_type');
  return raw || null;
}

function saveResultType(typeId) {
  sessionStorage.setItem('setsuyaku_result_type', typeId);
}
