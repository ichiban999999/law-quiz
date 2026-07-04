// Google Apps Script API Client
const GAS_WEB_APP_URL = process.env.GAS_WEB_APP_URL || '';

interface GasRequestParams {
  action: string;
  [key: string]: any;
}

interface GasResponse {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

/**
 * 發送 GET 請求到 GAS
 */
export async function gasGet(params: GasRequestParams): Promise<GasResponse> {
  if (!GAS_WEB_APP_URL) {
    throw new Error('GAS_WEB_APP_URL is not configured');
  }

  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    queryParams.set(key, String(value));
  }

  const url = `${GAS_WEB_APP_URL}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GAS GET request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GAS GET error:', error);
    throw error;
  }
}

/**
 * 發送 POST 請求到 GAS
 */
export async function gasPost(params: GasRequestParams): Promise<GasResponse> {
  if (!GAS_WEB_APP_URL) {
    throw new Error('GAS_WEB_APP_URL is not configured');
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GAS POST request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GAS POST error:', error);
    throw error;
  }
}

/**
 * 取得所有法規
 */
export async function getAllLaws() {
  return gasGet({ action: 'get-laws' });
}

/**
 * 根據 ID 取得法規
 */
export async function getLawById(id: string) {
  return gasGet({ action: 'get-law', id });
}

/**
 * 取得隨機題目
 */
export async function getRandomQuizzes(subject?: string, count: number = 10) {
  const params: any = { action: 'get-quizzes', count };
  if (subject) params.subject = subject;
  return gasGet(params);
}

/**
 * 取得所有科目
 */
export async function getSubjects() {
  return gasGet({ action: 'get-subjects' });
}

/**
 * 取得使用者統計
 */
export async function getUserStats(userId: string) {
  return gasGet({ action: 'get-stats', userId });
}

/**
 * 取得使用者錯題
 */
export async function getWrongAnswers(userId: string) {
  return gasGet({ action: 'get-wrong-answers', userId });
}

/**
 * 提交答案並記錄成績
 */
export async function submitAnswer(userId: string, quizId: number, subject: string, isCorrect: boolean, userAnswer: string) {
  return gasPost({
    action: 'submit-answer',
    userId,
    quizId,
    subject,
    isCorrect,
    userAnswer,
  });
}

/**
 * 初始化資料庫
 */
export async function initDatabase(force: boolean = false) {
  return gasPost({
    action: 'init-db',
    force,
  });
}

/**
 * 儲存法規
 */
export async function saveLaw(law: any) {
  return gasPost({
    action: 'save-law',
    law,
  });
}

/**
 * 儲存題目
 */
export async function saveQuiz(quiz: any) {
  return gasPost({
    action: 'save-quiz',
    quiz,
  });
}

/**
 * 檢查資料庫狀態
 */
export async function checkDbStatus() {
  return gasGet({ action: 'check-db' });
}