import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = '1g7N7rQp1493tXZb4aSR5GBkdeOjrWcR4-cAHnBX1uN4';
const KEY_FILE = path.resolve('jdifl-management-c267c4940dec.json');

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Helper to initialize sheet tabs and headers
async function ensureSheetsStructure() {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetTitles = meta.data.sheets.map(s => s.properties.title);

    const requests = [];
    
    if (!sheetTitles.includes('업무 관리')) {
      requests.push({
        addSheet: { properties: { title: '업무 관리' } }
      });
    }
    
    if (!sheetTitles.includes('KPI 리포트')) {
      requests.push({
        addSheet: { properties: { title: 'KPI 리포트' } }
      });
    }
    
    if (!sheetTitles.includes('시스템 로그')) {
      requests.push({
        addSheet: { properties: { title: '시스템 로그' } }
      });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests }
      });
    }

    // Set headers if sheets are fresh
    const taskHeaders = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'업무 관리'!A1:E1"
    });

    if (!taskHeaders.data.values || taskHeaders.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'업무 관리'!A1:E7",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            ['ID', '업무명', '상태', '지시사항', '특이사항'],
            ['v0-recipe', 'v0 랜페이지 레시피 배포', '완료', '', ''],
            ['kpi-funnel', '수익화 퍼널 및 타이머 가동', '완료', '', ''],
            ['shortform-video', '숏폼 영상 자동화 팩 배포 및 시뮬레이터', '진행중', '', ''],
            ['micro-translate', '해외 구매대행 상세페이지 한글화 번역 대행', '진행중', '', ''],
            ['micro-sns-sub', '동네 학원 전용 인스타 카드뉴스 및 릴스 기획 구독', '진행중', '', ''],
            ['micro-proposal-draft', '정부지원금 사업계획서 1차 초안 뼈대 대행', '진행중', '', '']
          ]
        }
      });
    }

    const kpiHeaders = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'KPI 리포트'!A1:D1"
    });

    if (!kpiHeaders.data.values || kpiHeaders.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "'KPI 리포트'!A1:D1",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['시간', '리드 유입', '판매 전환', '매출']]
        }
      });
    }
  } catch (err) {
    console.error('Error ensuring sheets structure:', err.message);
  }
}

// 1. GET: Fetch task lists for React polling
app.get('/api/sheet-data', async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'업무 관리'!A2:E20"
    });

    const rows = result.data.values || [];
    const formattedTasks = rows.map((r) => ({
      id: r[0],
      title: r[1],
      status: r[2] || '대기',
      instruction: r[3] || '',
      qaNotes: r[4] || ''
    }));

    res.json({ success: true, tasks: formattedTasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1.5 GET: Fetch system logs from sheets for terminal console
app.get('/api/system-logs', async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'시스템 로그'!A2:B100"
    });

    const rows = result.data.values || [];
    const logs = rows.map((r) => ({
      time: r[0] || '',
      message: r[1] || ''
    }));

    res.json({ success: true, logs: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1.6 GET: Fetch recipes from recipes.json
app.get('/api/recipes', (req, res) => {
  try {
    const data = fs.readFileSync(path.resolve('recipes.json'), 'utf-8');
    res.json({ success: true, recipes: JSON.parse(data) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST: Update single task status & QA comments
app.post('/api/update-status', async (req, res) => {
  const { id, status, comment, qaNotes } = req.body;
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'업무 관리'!A1:A10"
    });

    const rows = result.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === id) + 1;

    if (rowIndex === 0) {
      return res.status(404).json({ success: false, message: 'Task ID not found' });
    }

    if (status !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'업무 관리'!C${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[status]] }
      });
    }

    if (comment !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'업무 관리'!D${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[comment]] }
      });
    }

    if (qaNotes !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'업무 관리'!E${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[qaNotes]] }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST: Log KPI reports hourly
app.post('/api/log-kpi', async (req, res) => {
  const { leads, conversions, revenue } = req.body;
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "'KPI 리포트'!A:D",
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[timestamp, leads, conversions, revenue]]
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST: Real-time Discord Webhook Mirroring
app.post('/api/discord-log', async (req, res) => {
  const { webhookUrl, username, content } = req.body;
  if (!webhookUrl) {
    console.log(`[Local Discord Log] [${username}]: ${content}`);
    return res.json({ success: true, local: true });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username || 'JDIFL Agent Console',
        content: content
      })
    });

    if (response.ok) {
      res.json({ success: true });
    } else {
      res.status(response.status).json({ success: false, error: 'Discord API error' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. POST: Autonomous B2B Outreach using Brevo HTTPS REST API (Port 443 Bypass)
app.post('/api/send-outreach', async (req, res) => {
  const { targets } = req.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  const sendResults = [];

  for (const t of targets) {
    const emailBody = `안녕하세요, ${t.company} ${t.contact || '담당자님'}.
JDIFL AI 자동화 팩토리의 B2B 사업 파트너십 담당 부서입니다.

최근 귀사께서 ${t.trigger} 하신 내역을 감지하고, 수작업 상담 피로 감축 및 수동 가공 시간을 1/10로 단축해 드리는 자동화 방안이 긴급히 유용할 것으로 사료되어 연락드렸습니다.

저희는 최신 AI 멀티 에이전트 엔진을 활용하여 기업의 수동 작업(상세페이지 번역 / SNS 마케팅 기획 / 서류 탐지율 최적화)을 완전 자동화해주는 B2B 에이전트 대행 서비스를 제공하고 있습니다.

현재 귀사의 비즈니스 카테고리에 최적화된 [${t.niche || 'AI 도입'} 패키지] 파일럿을 선착순 10개사에 한해 무상 기획/세팅해 드리는 프로모션을 진행 중입니다.

* 본 파일럿의 혜택:
1. 귀사 전용 맞춤형 AI 에이전트 무료 세팅 (1회성)
2. 초기 인건비 및 마케팅 기획 소모 시간 평균 90% 감축 효과 검증
3. 도입 후 매출 증대 발생 시에만 10%의 이익을 공유하는 '수익 쉐어형 파트너십' 기회 제공

본 제안에 관심이 있으시거나 무료 세팅을 원하시면 본 메일로 회신해 주시기 바랍니다.

JDIFL 미래 기획 전략 본부 드림.`;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: "JDIFL B2B 사업본부", email: "contact@jdifl.com" },
          to: [{ email: t.email, name: t.company }],
          subject: `[제안] 귀사(${t.company})의 월 마케팅/작업 & 비용을 절감하는 AI 에이전트 도입 제안`,
          textContent: emailBody
        })
      });

      if (response.ok) {
        const data = await response.json();
        sendResults.push({ company: t.company, email: t.email, success: true, messageId: data.messageId });
      } else {
        const errText = await response.text();
        console.error(`Failed to send via HTTP to ${t.email}:`, errText);
        sendResults.push({ company: t.company, email: t.email, success: false, error: errText });
      }
    } catch (err) {
      console.error(`Fetch API error to ${t.email}:`, err.message);
      sendResults.push({ company: t.company, email: t.email, success: false, error: err.message });
    }
  }

  res.json({ success: true, results: sendResults });
});

app.listen(PORT, async () => {
  console.log(`JDIFL API Server running on http://localhost:${PORT}`);
  await ensureSheetsStructure();
});
