import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 取得資料庫路徑 - 針對 Vercel standalone 部署優化
function getDbPath(): string {
  // 嘗試多個可能的路徑
  const possiblePaths = [
    path.join(process.cwd(), 'data.db'),
    path.join(process.cwd(), '.next', 'standalone', 'data.db'),
    path.join(process.cwd(), '.next', 'data.db'),
    process.env.DATABASE_PATH || path.join('/tmp', 'data.db'),
  ];
  
  for (const p of possiblePaths) {
    try {
      // 確保目錄存在
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // 測試寫入
      fs.writeFileSync(p, '');
      return p;
    } catch (e) {
      console.log(`Path not writable: ${p}`, e);
      continue;
    }
  }
  
  // 最後 fallback 到 /tmp
  const fallbackPath = '/tmp/data.db';
  if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp', { recursive: true });
  }
  return fallbackPath;
}

const dbPath = getDbPath();
console.log('Using database path:', dbPath);

// 初始化資料庫
let db: any;

function createTables(dbInstance: any) {
  // 題庫資料表
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      answer TEXT NOT NULL CHECK(answer IN ('A', 'B', 'C', 'D')),
      articles TEXT NOT NULL,
      explanation TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 使用者資料表
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 成績記錄資料表
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      quiz_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      user_answer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    );
  `);

  // 錯題本資料表
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS wrong_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      quiz_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      review_count INTEGER DEFAULT 0,
      last_reviewed DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    );
  `);

  // 法規資料表
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS laws (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables created successfully.');
}

// 初始化資料庫
export function initializeDatabase() {
  try {
    db = new Database(dbPath);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }

  // 啟用 WAL 模式以提高效能
  db.pragma('journal_mode = WAL');
  
  // 建立所有資料表
  createTables(db);
}

// 模組載入時立即初始化
try {
  initializeDatabase();
  console.log('Database auto-initialized on module load');
} catch (error) {
  console.error('Failed to auto-initialize database:', error);
}

// 插入範例題目
export function seedSampleQuizzes() {
  const count = db.prepare('SELECT COUNT(*) as count FROM quizzes').get() as { count: number };
  
  if ((count as { count: number }).count > 0) {
    console.log('Quizzes already exist, skipping seed.');
    return;
  }

  const sampleQuizzes = [
    // 民法
    {
      subject: '民法',
      question: '依民法規定，下列何者為無行為能力人？',
      option_a: '十七歲之未成年人',
      option_b: '未結婚之十八歲成年人',
      option_c: '未滿七歲之未成年人',
      option_d: '七歲以上之未成年人',
      answer: 'C',
      articles: '民法第44條',
      explanation: '依民法第44條規定：「未滿七歲之未成年人，無行為能力。」故選項(C)為正確答案。',
      difficulty: 1
    },
    {
      subject: '民法',
      question: '民法所稱「物」包括下列何者？',
      option_a: '僅限有體物',
      option_b: '有體物及無體物（如權利）',
      option_c: '僅限動產',
      option_d: '僅限不動產',
      answer: 'A',
      articles: '民法第66條、第69條',
      explanation: '民法上之「物」原則上指有體物，即佔有空間、存在於現實世界而有體積之物。權利原則上不認為是物，但法律有特別規定者除外。',
      difficulty: 2
    },
    {
      subject: '民法',
      question: '依民法規定，請求權因一定期間不行使而消滅，一般請求權的消滅時效為多久？',
      option_a: '十年',
      option_b: '十五年',
      option_c: '十五年',
      option_d: '二十年',
      answer: 'A',
      articles: '民法第125條',
      explanation: '依民法第125條規定：「請求權，因十五年间不行使而消滅。但法律所定期間較短者，依其規定。」故一般請求權的消滅時效為15年。',
      difficulty: 1
    },
    // 刑法
    {
      subject: '刑法',
      question: '依我國刑法規定，未犯告訴之罪者，其效力及於下列何者？',
      option_a: '共犯',
      option_b: '緊接之傷殘',
      option_c: '誣告',
      option_d: '以上皆是',
      answer: 'D',
      articles: '刑法第239條',
      explanation: '依刑法第239條規定：「犯本條之罪者，須經告訴乃論。對於共犯之一人告發或告訴，而其他共犯亦在告訴乃論之罪者，其效力及於其他共犯。」',
      difficulty: 2
    },
    {
      subject: '刑法',
      question: '刑法上的「故意」分為下列何兩種？',
      option_a: '直接故意與間接故意',
      option_b: '明知與預見',
      option_c: '確定故意與不確定故意',
      option_d: '以上皆是',
      answer: 'D',
      articles: '刑法第13條、第14條',
      explanation: '刑法第13條規定故意分為直接故意（確定故意）與間接故意（不確定故意）。第14條則規定過失。學理上故意可分為「明知並有意使其發生」（直接故意）及「預見其發生而其發生並不違背本意」（間接故意）。',
      difficulty: 2
    },
    {
      subject: '刑法',
      question: '依刑法規定，未遂犯的處罰採下列何種主義？',
      option_a: '普遍處罰主義',
      option_b: '限制處罰主義',
      option_c: '不處罰未遂主義',
      option_d: '裁量處罰主義',
      answer: 'B',
      articles: '刑法第25條',
      explanation: '依刑法第25條規定：「已經著手於犯罪行為之實行而不成立或既遂者，處以罰刑。但得減輕其刑。」我國刑法對未遂犯採「限制處罰主義」，即僅處罰刑法有特別規定之罪。',
      difficulty: 2
    },
    // 憲法
    {
      subject: '憲法',
      question: '依憲法規定，下列何者不是國民應盡之義務？',
      option_a: '服兵役',
      option_b: '納稅',
      option_c: '參加考試',
      option_d: '受教育',
      answer: 'C',
      articles: '憲法第21條、第22條、第23條、第24條',
      explanation: '憲法第21條規定國民有受義務教育的權利與義務。第23條規定納稅與服兵役為國民義務。參加考試是國民的權利（憲法第18條），而非義務。',
      difficulty: 1
    },
    {
      subject: '憲法',
      question: '憲法增修條文規定，總統、副總統罷免案由立法院提出，經多少個以上審議通過？',
      option_a: '四分之一',
      option_b: '三分之一',
      option_c: '二分之一',
      option_d: '四分之三',
      answer: 'B',
      articles: '憲法增修條文第9條',
      explanation: '依憲法增修條文第9條規定：「總統、副總統之罷免案，經立法院全體立法委員四分之一以上提議，三分之二以上決議通過後，送交自由地區公民投票決定。」',
      difficulty: 2
    },
    // 行政法
    {
      subject: '行政法',
      question: '依行政程序法規定，行政處分之相對人及知悉行政處分之其他之人，其救濟期間自何日起算？',
      option_a: '處分之日',
      option_b: '告知之日',
      option_c: '通知之日',
      option_d: '公告之日',
      answer: 'B',
      articles: '行政訴訟法第54條',
      explanation: '依行政訴訟法規定，撤銷訴訟之原告資格需有權利受損之事實，且救濟期間自合法通知或告知之日起算。',
      difficulty: 2
    },
    {
      subject: '行政法',
      question: '下列何者不是行政處分的生效要件？',
      option_a: '書面形式',
      option_b: '告知事項',
      option_c: '說明理由',
      option_d: '經法院核准',
      answer: 'D',
      articles: '行政程序法第96條',
      explanation: '依行政程序法第96條規定，行政處分之書面應記載事項包括：相對人、主文、事實、理由、救濟告知等。但不需要經法院核准。',
      difficulty: 2
    },
    // 民事訴訟法
    {
      subject: '民事訴訟法',
      question: '依民事訴訟法規定，通常第一審管轄法院為？',
      option_a: '被告住所地法院',
      option_b: '原告住所地法院',
      option_c: '行為地法院',
      option_d: '財產所在地法院',
      answer: 'A',
      articles: '民事訴訟法第1條',
      explanation: '依民事訴訟法第1條規定：「涉訟事件，由被告住所地之法院管轄。被告住所地之法院不能行使權力者，得由原告住所地之法院管轄。」',
      difficulty: 1
    },
    {
      subject: '民事訴訟法',
      question: '民事訴訟中，當事人於第一審為訴之變更或追加，原則上？',
      option_a: '允許之',
      option_b: '不允許之，但被告同意者除外',
      option_c: '不允許之',
      option_d: '由法院裁量決定',
      answer: 'B',
      articles: '民事訴訟法第255條',
      explanation: '依民事訴訟法第255條規定，原告於判決確定前，得將訴變更或追加他訴。但被告同意者，不在此限。',
      difficulty: 3
    },
    // 刑事訴訟法
    {
      subject: '刑事訴訟法',
      question: '刑事訴訟法規定，檢察官就被告犯罪事實，應負舉證責任，此為？',
      option_a: '無罪推定原則',
      option_b: '舉證責任分配原則',
      option_c: '罪證有疑，利於被告原則',
      option_d: '直接審理原則',
      answer: 'B',
      articles: '刑事訴訟法第161條',
      explanation: '依刑事訴訟法第161條第1項規定：「檢察官就被告犯罪事實，應負舉證責任，並指出證明方法。」',
      difficulty: 1
    },
    {
      subject: '刑事訴訟法',
      question: '下列何者不是強制處分之種類？',
      option_a: '搜索',
      option_b: '扣押',
      option_c: '拘提',
      option_d: '傳喚',
      answer: 'D',
      articles: '刑事訴訟法第75條以下',
      explanation: '強制處分包括搜索、扣押、拘提、羈押等。傳喚屬於通知到庭的程序，不具強制性，因此不是強制處分。',
      difficulty: 2
    },
    // 土地法
    {
      subject: '土地法',
      question: '依土地法規定，私有土地面積不得少於道路臨界寬度之若干倍？',
      option_a: '一倍',
      option_b: '一倍半',
      option_c: '二倍',
      option_d: '三倍',
      answer: 'B',
      articles: '土地法第14條',
      explanation: '依土地法規定，臨街地深度超過標準深度者，其超過部分視為剩餘地。剩餘地面積如不及道路臨界寬度之一倍半者，應與前面臨街地合併劃為一宗。',
      difficulty: 3
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO quizzes (subject, question, option_a, option_b, option_c, option_d, answer, articles, explanation, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((quizzes: any[]) => {
    for (const quiz of quizzes) {
      insertStmt.run(
        quiz.subject,
        quiz.question,
        quiz.option_a,
        quiz.option_b,
        quiz.option_c,
        quiz.option_d,
        quiz.answer,
        quiz.articles,
        quiz.explanation,
        quiz.difficulty
      );
    }
  });

  insertMany(sampleQuizzes);
  console.log(`${sampleQuizzes.length} sample quizzes seeded.`);
}

// 取得所有科目列表
export function getSubjects(): string[] {
  const rows = db.prepare(
    `SELECT DISTINCT subject FROM quizzes ORDER BY subject`
  ).all() as { subject: string }[];
  return rows.map(row => row.subject);
}

// 取得隨機題目
export function getRandomQuizzes(subject: string | null, count: number = 10) {
  let query = 'SELECT * FROM quizzes';
  const params: any[] = [];

  if (subject) {
    query += ' WHERE subject = ?';
    params.push(subject);
  }

  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(count);

  return db.prepare(query).all(...params) as any[];
}

// 根據 ID 取得題目
export function getQuizById(id: number) {
  return db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id) as any;
}

// 取得指定科目的題目（用於測驗）
export function getQuizzesBySubject(subject: string, count: number = 20) {
  return db.prepare(
    'SELECT * FROM quizzes WHERE subject = ? ORDER BY RANDOM() LIMIT ?'
  ).all(subject, count) as any[];
}

// 取得使用者的成績統計
export function getUserStats(userId: string) {
  const stats = db.prepare(`
    SELECT 
      subject,
      COUNT(*) as total,
      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as accuracy
    FROM scores 
    WHERE user_id = ?
    GROUP BY subject
    ORDER BY subject
  `).all(userId) as any[];
  return stats;
}

// 取得使用者的錯題
export function getWrongAnswers(userId: string) {
  return db.prepare(`
    SELECT w.*, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.answer, q.explanation
    FROM wrong_answers w
    JOIN quizzes q ON w.quiz_id = q.id
    WHERE w.user_id = ?
    ORDER BY w.review_count DESC
  `).all(userId) as any[];
}

// 記錄成績
export function recordScore(
  userId: string,
  quizId: number,
  subject: string,
  isCorrect: boolean,
  userAnswer: string
) {
  const insertScore = db.prepare(`
    INSERT INTO scores (user_id, quiz_id, subject, is_correct, user_answer)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertScore.run(userId, quizId, subject, isCorrect, userAnswer);

  // 如果答錯，加入錯題本
  if (!isCorrect) {
    const existing = db.prepare(
      'SELECT * FROM wrong_answers WHERE user_id = ? AND quiz_id = ?'
    ).get(userId, quizId);

    if (existing) {
      db.prepare(`
        UPDATE wrong_answers 
        SET review_count = review_count + 1, last_reviewed = CURRENT_TIMESTAMP
        WHERE user_id = ? AND quiz_id = ?
      `).run(userId, quizId);
    } else {
      db.prepare(`
        INSERT INTO wrong_answers (user_id, quiz_id, subject)
        VALUES (?, ?, ?)
      `).run(userId, quizId, subject);
    }
  }
}

// 取得測驗統計
export function getQuizStats(userId: string) {
  const total = db.prepare(
    'SELECT COUNT(*) as count FROM scores WHERE user_id = ?'
  ).get(userId) as { count: number };

  const correct = db.prepare(
    'SELECT COUNT(*) as count FROM scores WHERE user_id = ? AND is_correct = 1'
  ).get(userId) as { count: number };

  return {
    total: total.count,
    correct: correct.count,
    accuracy: total.count > 0 ? Math.round((correct.count / total.count) * 10000) / 100 : 0
  };
}

// 關閉資料庫連線
export function closeDatabase() {
  db.close();
}

// 法規相關函數

// 取得所有法規列表
export function getAllLaws(): any[] {
  return db.prepare(
    `SELECT id, name, category, updated_at FROM laws ORDER BY category, name`
  ).all() as any[];
}

// 根據 ID 取得法規內容
export function getLawById(id: string): any {
  return db.prepare(
    `SELECT * FROM laws WHERE id = ?`
  ).get(id) as any;
}

// 根據類別取得法規
export function getLawsByCategory(category: string): any[] {
  return db.prepare(
    `SELECT id, name, category, updated_at FROM laws WHERE category = ? ORDER BY name`
  ).all(category) as any[];
}

// 儲存法規
export function saveLaw(law: {
  id: string;
  name: string;
  category: string;
  content: string;
  updated_at?: string;
}) {
  const existing = db.prepare('SELECT id FROM laws WHERE id = ?').get(law.id);
  
  if (existing) {
    db.prepare(`
      UPDATE laws SET name = ?, category = ?, content = ?, updated_at = ?
      WHERE id = ?
    `).run(law.name, law.category, law.content, law.updated_at || new Date().toISOString(), law.id);
  } else {
    db.prepare(`
      INSERT INTO laws (id, name, category, content, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(law.id, law.name, law.category, law.content, law.updated_at || new Date().toISOString());
  }
}

// 清空法規資料表
export function clearLaws() {
  db.exec('DELETE FROM laws');
}

// 導出資料庫實例
export default db;
