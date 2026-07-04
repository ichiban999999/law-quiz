// ============================================
// LawQuiz Google Apps Script API
// ============================================

const sheetNames = {
  laws: 'laws',
  quizzes: 'quizzes',
  scores: 'scores',
  wrongAnswers: 'wrong_answers'
};

// 處理 GET 請求
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || '';
  
  try {
    switch (action) {
      case 'get-laws':
        return jsonResponse(getAllLaws());
      
      case 'get-law':
        return jsonResponse(getLawById(params.id));
      
      case 'get-quizzes':
        return jsonResponse(getQuizzes(params.subject, parseInt(params.count) || 10));
      
      case 'get-subjects':
        return jsonResponse(getSubjects());
      
      case 'get-stats':
        return jsonResponse(getUserStats(params.userId));
      
      case 'get-wrong-answers':
        return jsonResponse(getWrongAnswers(params.userId));
      
      case 'check-db':
        return jsonResponse({ status: 'ok', sheetIds: getSheetInfo() });
      
      case 'setup-sheets':
        // 自動建立所有工作表
        setupAllSheets();
        return jsonResponse({ status: 'ok', message: 'All sheets created successfully', sheetIds: getSheetInfo() });
      
      default:
        return jsonResponse({ error: 'Unknown action', availableActions: ['get-laws', 'get-law', 'get-quizzes', 'get-subjects', 'get-stats', 'get-wrong-answers', 'check-db', 'setup-sheets'] });
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// 處理 POST 請求
function doPost(e) {
  let data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return jsonResponse({ error: 'Invalid JSON' });
  }
  
  const action = data.action || '';
  
  try {
    switch (action) {
      case 'init-db':
        return jsonResponse(initDatabase(data.force || false));
      
      case 'save-law':
        return jsonResponse(saveLaw(data.law));
      
      case 'save-quiz':
        return jsonResponse(saveQuiz(data.quiz));
      
      case 'submit-answer':
        return jsonResponse(recordScore(data.userId, data.quizId, data.subject, data.isCorrect, data.userAnswer));
      
      case 'clear-laws':
        return jsonResponse(clearLaws());
      
      default:
        return jsonResponse({ error: 'Unknown action', availableActions: ['init-db', 'save-law', 'save-quiz', 'submit-answer', 'clear-laws'] });
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// ============================================
// 自動建立所有工作表
// ============================================

function setupAllSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 建立 laws 工作表
  let lawsSheet = spreadsheet.getSheetByName('laws');
  if (!lawsSheet) {
    lawsSheet = spreadsheet.insertSheet('laws');
    lawsSheet.appendRow(['id', 'name', 'category', 'content', 'updated_at']);
  }
  
  // 建立 quizzes 工作表
  let quizzesSheet = spreadsheet.getSheetByName('quizzes');
  if (!quizzesSheet) {
    quizzesSheet = spreadsheet.insertSheet('quizzes');
    quizzesSheet.appendRow(['id', 'subject', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'answer', 'articles', 'explanation', 'difficulty']);
  }
  
  // 建立 scores 工作表
  let scoresSheet = spreadsheet.getSheetByName('scores');
  if (!scoresSheet) {
    scoresSheet = spreadsheet.insertSheet('scores');
    scoresSheet.appendRow(['id', 'user_id', 'quiz_id', 'subject', 'is_correct', 'user_answer', 'created_at']);
  }
  
  // 建立 wrong_answers 工作表
  let wrongAnswersSheet = spreadsheet.getSheetByName('wrong_answers');
  if (!wrongAnswersSheet) {
    wrongAnswersSheet = spreadsheet.insertSheet('wrong_answers');
    wrongAnswersSheet.appendRow(['id', 'user_id', 'quiz_id', 'subject', 'review_count', 'last_reviewed']);
  }
  
  return { success: true, message: 'All sheets setup completed' };
}

// ============================================
// 法規相關函數
// ============================================

function getAllLaws() {
  const sheet = getSheet(sheetNames.laws);
  if (!sheet) return { success: true, laws: {}, count: 0 };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, laws: {}, count: 0 };
  
  const groupedLaws = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = row[0];
    const category = row[2];
    
    if (!groupedLaws[category]) {
      groupedLaws[category] = [];
    }
    
    groupedLaws[category].push({
      id: id,
      name: row[1],
      updated_at: row[4] ? formatDate(row[4]) : null
    });
  }
  
  return { success: true, laws: groupedLaws, count: data.length - 1 };
}

function getLawById(id) {
  const sheet = getSheet(sheetNames.laws);
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      return {
        id: data[i][0],
        name: data[i][1],
        category: data[i][2],
        content: data[i][3],
        updated_at: data[i][4] ? formatDate(data[i][4]) : null
      };
    }
  }
  return null;
}

function saveLaw(law) {
  const sheet = getOrCreateSheet(sheetNames.laws, ['id', 'name', 'category', 'content', 'updated_at']);
  const data = sheet.getDataRange().getValues();
  
  // 檢查是否已存在
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == law.id) {
      // 更新現有資料
      sheet.getRange(i + 1, 2, 1, 4).setValues([[law.name, law.category, law.content, law.updated_at || new Date().toISOString()]]);
      return { success: true, action: 'updated', id: law.id };
    }
  }
  
  // 新增新資料
  sheet.appendRow([law.id, law.name, law.category, law.content, law.updated_at || new Date().toISOString()]);
  return { success: true, action: 'created', id: law.id };
}

function clearLaws() {
  const sheet = getSheet(sheetNames.laws);
  if (!sheet) return { success: true, message: 'Sheet not found' };
  
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  return { success: true, message: 'All laws cleared' };
}

// ============================================
// 題庫相關函數
// ============================================

function getQuizzes(subject, count) {
  const sheet = getSheet(sheetNames.quizzes);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const quizzes = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!subject || data[i][1] == subject) {
      quizzes.push({
        id: data[i][0],
        subject: data[i][1],
        question: data[i][2],
        option_a: data[i][3],
        option_b: data[i][4],
        option_c: data[i][5],
        option_d: data[i][6],
        answer: data[i][7],
        articles: data[i][8],
        explanation: data[i][9],
        difficulty: data[i][10]
      });
    }
    if (quizzes.length >= count) break;
  }
  
  return { success: true, quizzes: quizzes, count: quizzes.length };
}

function getSubjects() {
  const sheet = getSheet(sheetNames.quizzes);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const subjects = new Set();
  
  for (let i = 1; i < data.length; i++) {
    subjects.add(data[i][1]);
  }
  
  return { success: true, subjects: Array.from(subjects) };
}

function saveQuiz(quiz) {
  const sheet = getOrCreateSheet(sheetNames.quizzes, ['id', 'subject', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'answer', 'articles', 'explanation', 'difficulty']);
  
  // 檢查是否已存在
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == quiz.id) {
      sheet.getRange(i + 1, 2, 1, 10).setValues([[quiz.subject, quiz.question, quiz.option_a, quiz.option_b, quiz.option_c, quiz.option_d, quiz.answer, quiz.articles, quiz.explanation, quiz.difficulty]]);
      return { success: true, action: 'updated', id: quiz.id };
    }
  }
  
  sheet.appendRow([quiz.id, quiz.subject, quiz.question, quiz.option_a, quiz.option_b, quiz.option_c, quiz.option_d, quiz.answer, quiz.articles, quiz.explanation, quiz.difficulty]);
  return { success: true, action: 'created', id: quiz.id };
}

// ============================================
// 成績相關函數
// ============================================

function recordScore(userId, quizId, subject, isCorrect, userAnswer) {
  const sheet = getOrCreateSheet(sheetNames.scores, ['id', 'user_id', 'quiz_id', 'subject', 'is_correct', 'user_answer', 'created_at']);
  
  // 產生新的 ID
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  sheet.appendRow([newId, userId, quizId, subject, isCorrect ? 'TRUE' : 'FALSE', userAnswer, new Date().toISOString()]);
  
  // 如果答錯，加入錯題本
  if (!isCorrect) {
    addWrongAnswer(userId, quizId, subject);
  }
  
  return { success: true, id: newId };
}

function getUserStats(userId) {
  const sheet = getSheet(sheetNames.scores);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const stats = {};
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == userId) {
      const subject = data[i][3];
      if (!stats[subject]) {
        stats[subject] = { subject: subject, total: 0, correct: 0 };
      }
      stats[subject].total++;
      if (data[i][4] === true || data[i][4] === 'TRUE') {
        stats[subject].correct++;
      }
    }
  }
  
  return { success: true, stats: Object.values(stats) };
}

function getWrongAnswers(userId) {
  const sheet = getSheet(sheetNames.wrongAnswers);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const wrong = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == userId) {
      wrong.push({
        id: data[i][0],
        user_id: data[i][1],
        quiz_id: data[i][2],
        subject: data[i][3],
        review_count: data[i][4],
        last_reviewed: data[i][5]
      });
    }
  }
  
  return { success: true, wrongAnswers: wrong };
}

function addWrongAnswer(userId, quizId, subject) {
  const sheet = getOrCreateSheet(sheetNames.wrongAnswers, ['id', 'user_id', 'quiz_id', 'subject', 'review_count', 'last_reviewed']);
  const data = sheet.getDataRange().getValues();
  
  // 檢查是否已存在
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == userId && data[i][2] == quizId) {
      sheet.getRange(i + 1, 5, 1, 2).setValues([[data[i][4] + 1, new Date().toISOString()]]);
      return { success: true, action: 'updated' };
    }
  }
  
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  sheet.appendRow([newId, userId, quizId, subject, 1, new Date().toISOString()]);
  return { success: true, action: 'created' };
}

// ============================================
// 資料庫初始化
// ============================================

function initDatabase(force) {
  const lawsSheet = getSheet(sheetNames.laws);
  const quizzesSheet = getSheet(sheetNames.quizzes);
  
  if (!force && lawsSheet && lawsSheet.getLastRow() > 1) {
    return {
      success: true,
      message: 'Database already has data. Use force=true to re-sync.',
      lawCount: lawsSheet.getLastRow() - 1,
      quizCount: quizzesSheet ? quizzesSheet.getLastRow() - 1 : 0
    };
  }
  
  return {
    success: true,
    message: 'Database ready for initialization',
    lawCount: lawsSheet ? lawsSheet.getLastRow() - 1 : 0,
    quizCount: quizzesSheet ? quizzesSheet.getLastRow() - 1 : 0
  };
}

// ============================================
// 輔助函數
// ============================================

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    console.log('Sheet not found: ' + name);
    return null;
  }
  return sheet;
}

function getOrCreateSheet(name, headers) {
  let sheet = getSheet(name);
  if (!sheet) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    sheet = spreadsheet.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function formatDate(date) {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
}

function getSheetInfo() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  const info = {};
  
  for (let i = 0; i < sheets.length; i++) {
    info[sheets[i].getName()] = sheets[i].getLastRow() + ' rows';
  }
  
  return info;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}