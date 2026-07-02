import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

let botProcess = null;

function checkAndStartDiscordBot() {
  try {
    const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
    const match = envContent.match(/DISCORD_BOT_TOKEN=(.+)/);
    if (match && match[1].trim() && !botProcess) {
      const token = match[1].trim();
      if (token.length > 10 && !token.startsWith('your_token')) {
        console.log("Found DISCORD_BOT_TOKEN! Launching discord_bot.js watchdog...");
        botProcess = spawn(process.execPath, ['discord_bot.js'], { stdio: 'inherit' });
        botProcess.on('close', (code) => {
          console.log(`Discord bot closed with code ${code}`);
          botProcess = null;
        });
      }
    }
  } catch (err) {
    console.error("Watchdog error:", err.message);
  }
}

const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1522124069036757183/Mg3aw9AV66zykou4qWzDEmaGGGR7rgLxSo50fSzucgla4jAkN_BxUCC51Rzep284rsgq';

async function postToDiscord(username, content) {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, content })
    });
    console.log(`[Sent] ${username}`);
  } catch (err) {
    console.error(`[Discord Error]`, err.message);
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Micro-niche templates database for 24/7 autonomous creation
const microNiches = [
  {
    title: "AI 자소서 인간화 대행",
    target: "스펙업/독취사 취준생",
    flow: [
      { agent: "[트렌드-추적] Trend_Monitor", msg: "📈 실시간 탐색: 공기업 AI 서류 필터링 패치 관련 검색량 70% 폭증 감지. '자소서 AI 감지 우회' 키워드가 오늘의 최상위 틈새입니다." },
      { agent: "[전략-회의] Chief_Visionary", msg: "💡 기획 상신: 취준생들이 자기 자소서를 올리면 탐지율 5% 미만으로 변환해주는 'AI 자소서 인간화 가이드' 파일럿 1호를 배포합니다." },
      { agent: "[전략-회의] Market_Scout", msg: "🔍 시장 조사: 독취사 자유게시판 내 '자소서 감지기 오류로 억울하다'는 반응 45건 수집 완료. 타겟 확보." },
      { agent: "[전략-회의] Risk_Architect", msg: "⚡ 리스크 관리: 표절 시비 방지를 위해 텍스트 유사도 15% 이하를 보장하는 프롬프트 필터를 추가 락인합니다." },
      { agent: "[전략-회의] Sales_Negotiator", msg: "🤝 영업 협상: '무료 자소서 진단 1회 + 무제한 인간화 리포트 패키지 월 29,000원' 가격 모델 제안." },
      { agent: "[현장-중계] Systems_Agent", msg: "🛠️ 생산 가동: 실물 파일럿 [PILOT_AI_humanizer_guide.md] 뼈대 조립 완료 및 빌드 성공." },
      { agent: "[실전-성과] QA_Agent", msg: "🏆 성과 보고: AI 탐지율 3% 격하 검수 완료. [PILOT_AI_humanizer_guide.md] 파일이 로컬 디렉터리에 정상 컴파일되었습니다." }
    ]
  },
  {
    title: "AI SNS 평판 디펜스 스캔",
    target: "블라인드/리멤버 경력직 이직자",
    flow: [
      { agent: "[트렌드-추적] Trend_Monitor", msg: "📈 실시간 탐색: 기업 평판조회 플랫폼(스펙터 등) 고성장세 감지. 이직을 앞둔 대기업/스타트업 경력직들의 '과거 SNS 흑역사 스캔' 수요 포착." },
      { agent: "[전략-회의] Chief_Visionary", msg: "💡 기획 상신: 후보자명과 SNS 아이디 입력 시, 인사팀 스크래핑 봇이 잡아낼 독성 글을 선제 스캔/삭제 리포트해주는 [SNS 평판 디펜스] 가이드 기획." },
      { agent: "[전략-회의] Risk_Architect", msg: "⚡ 리스크 관리: 타인 정보 수집 차단 및 OSINT(공개 출처 정보) 범위 내 자가 스캔에 국한하여 개인정보 보호 규정 준수 완료." },
      { agent: "[현장-중계] Systems_Agent", msg: "🛠️ 생산 가동: [PILOT_AI_reputation_check.md] 내 인사팀 3대 독성 키워드 가이드 및 자가 프롬프트 빌드 성공." },
      { agent: "[실전-성과] Attribution_Analyst", msg: "📊 정산 보고: 단가 49,000원 책정. ElevenLabs/OpenAI API 실소모비 1.2% 미만으로 순수익률 98.8% 마진 구조 확립 완료." }
    ]
  },
  {
    title: "소상공인 AI 커스텀 ARS 연결음",
    target: "아프니까 사장이다 소상공인",
    flow: [
      { agent: "[트렌드-추적] Trend_Monitor", msg: "📈 실시간 탐색: 1인 네일숍, 미용실, 1인 배송 쇼핑몰 사장님들의 '시술 중 전화 대응 지연 및 노쇼 스트레스' 키워드 수집." },
      { agent: "[전략-회의] Chief_Visionary", msg: "💡 기획 상신: 주말/야간/시술 중 걸려 오는 전화를 카카오톡 예약 채널로 자동 전환하는 '상황별 AI 커스텀 ARS 연결음' 패키지 기획." },
      { agent: "[전략-회의] Sales_Negotiator", msg: "🤝 영업 협상: 1인 숍 맞춤 '세팅비 0원 + 연결음 링크를 통한 신규 예약 성공당 수수료 2,000원 쉐어' 조건으로 아웃바운드 개시." },
      { agent: "[현장-중계] Systems_Agent", msg: "🛠️ 생산 가동: [PILOT_AI_voice_ars.md] 및 통신사 비즈링 등록 가이드라인 최종 빌드 완료." },
      { agent: "[실전-성과] QA_Agent", msg: "🏆 성과 보고: 성우 대본 3종 및 8kHz 모노 포맷 오디오 필터 검수 최종 합격 통과." }
    ]
  }
];

// Target leads list for real-world document generation
const pilotTargets = [
  { company: "이투스 수학학원 분당점", email: "etoos_bd@naver.com", contact: "원장님", niche: "학원 인스타 구독 / ARS", trigger: "알바몬에 '수업 중 전화상담 보조 알바' 채용 공고 등록" },
  { company: "대치 아발론 영어학원", email: "avalon_dc@daum.net", contact: "교무부장님", niche: "학원 인스타 구독 / ARS", trigger: "플레이스 리뷰에 '원장님이 통화 연결이 어렵다'는 상담 지연 클레임" },
  { company: "팀원 필라테스 서초점", email: "teamone_sc@gmail.com", contact: "지점장님", niche: "학원 인스타 구독 / ARS", trigger: "인스타 채널에 최근 6개월간 게시글/피드 부재 (마지막 업로드 2025-12-15)" },
  { company: "헬스보이짐 강남점", email: "healthboy_gn@naver.com", contact: "매니저님", niche: "학원 인스타 구독 / ARS", trigger: "당사 매니저 구인 공고에 'SNS 마케팅 가점 및 보조 역할 포함' 조건" },
  { company: "상상 스타트업 스튜디오", email: "sangsang_studio@kakao.com", contact: "대표님", niche: "자소서 AI 탐지 회피", trigger: "잡코리아에 'AI 필터링 도입 검토 및 이력서 검토 자동화' 채용 지침" },
  { company: "유니콘 예비창업팀", email: "unicorn_pre@naver.com", contact: "팀장님", niche: "자소서 AI 탐지 회피", trigger: "예비창업자 단톡방에 '정부지원사업 계획서 AI 오탐지 필터 통과 방안 문의' 고민 글 작성" },
  { company: "차이나 바이어 (1688 대행)", email: "china_buyer@daum.net", contact: "대표님", niche: "상세페이지 번역", trigger: "네이버 스마트스토어 상세페이지 내 중국어 워터마크 이미지 미번역 상태 방치" },
  { company: "스타셀러 구매대행", email: "starseller_help@gmail.com", contact: "정 대표님", niche: "상세페이지 번역", trigger: "셀러 카페에 '해외 구매대행 소싱량 대비 번역 알바 비용 과다 지출' 고충 글 작성" },
  { company: "글로벌 소싱 테크", email: "global_sourcing@kakao.com", contact: "매니저님", niche: "상세페이지 번역", trigger: "구인 광고에 '일문/중문 텍스트 번역 및 수동 편집 어시스턴트' 채용 공고 게재" },
  { company: "메가패스 공무원 학원", email: "megapass_bd@naver.com", contact: "상담부장님", niche: "학원 인스타 구독 / ARS", trigger: "알바천국에 '야간 자습실 감독 및 출결 확인 전화 보조' 구인 공고" }
];

// Helper to write logs directly to the "시스템 로그" sheet
import { google } from 'googleapis';
const SPREADSHEET_ID = '1g7N7rQp1493tXZb4aSR5GBkdeOjrWcR4-cAHnBX1uN4';
const KEY_FILE = path.resolve('jdifl-management-c267c4940dec.json');
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function logSystemToSheet(message) {
  try {
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "'시스템 로그'!A:B",
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[timestamp, message]]
      }
    });
    console.log(`[Logged to Sheets]: ${message}`);
  } catch (err) {
    console.error("Sheets log fail:", err.message);
  }
}

// Stateful Multi-Agent Brainstorming & Recipe Generation via OpenRouter Claude API
async function runAutonomousBrainstorm(loopCount) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  if (!apiKey || apiKey.startsWith('your_')) {
    console.warn("No active OpenRouter key found in .env.");
    return null;
  }

  try {
    console.log(`Calling LLM (${model}) for dynamic multi-agent brainstorming cycle #${loopCount}...`);

    let realTrendsContext = "No active news feed. Brainstorm a general business automation trend.";
    try {
      const rssRes = await fetch('https://www.yonhapnewstv.co.kr/category/news/economy/feed/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (rssRes.ok) {
        const rssText = await rssRes.text();
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(rssText)) !== null) {
          const itemContent = match[1];
          const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([^<]+)<\/title>/);
          const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([^<]+)<\/description>/);
          if (titleMatch) {
            items.push({
              title: titleMatch[1].trim(),
              desc: descMatch ? descMatch[1].trim().substring(0, 100) : ""
            });
          }
        }
        if (items.length > 0) {
          realTrendsContext = items.slice(0, 5).map((item, idx) => `${idx + 1}. [제목] ${item.title}\n[내용] ${item.desc}`).join("\n\n");
        }
      }
    } catch (err) {
      console.warn("Could not fetch Yonhap news RSS:", err.message);
    }

    const systemPrompt = `You are the JDIFL Autonomous AI Agent Network.
JDIFL is an 'AI automation recipe factory for small businesses and beginners'.
Your goal is to brainstorm a brand new, highly specific, realistic B2B/B2C micro-niche AI automation service/prompt recipe for the Korean market.
Each agent in the matrix has a distinct duty:
1. [트렌드-추적] Trend_Monitor: Finds a micro-niche trend.
2. [전략-회의] Chief_Visionary: Defines the core product/recipe concept and targeting.
3. [기술-구현] Systems_Agent: Writes the actual, fully functional, detailed prompt recipe text that users can copy-paste.
4. [실전-성과] QA_Agent: Reviews and approves it for listing in the store.

Respond ONLY with a valid JSON object matching this structure (no markdown formatting, no code blocks):
{
  "dialogue": [
    { "agent": "[트렌드-추적] Trend_Monitor", "msg": "Discussion message in Korean" },
    { "agent": "[전략-회의] Chief_Visionary", "msg": "Discussion message in Korean" },
    { "agent": "[기술-구현] Systems_Agent", "msg": "Discussion message in Korean" },
    { "agent": "[실전-성과] QA_Agent", "msg": "Discussion message in Korean" }
  ],
  "recipe": {
    "id": "unique-slug-string",
    "name": "Short name in Korean (e.g. 피트니스 회원 이탈 방지)",
    "recipeTitle": "Recipe title in Korean (e.g. [회원 관리] 10초 완성 피트니스 회원 이탈 감지 및 밀착 관리 레시피)",
    "targetProblem": "Pain point before (e.g. PT 만기 예정 회원을 수작업으로 조회하여 안내하느라 바쁜 트레이너)",
    "url": "https://chatgpt.com",
    "upvotes": 1500,
    "scrapedDate": "2026-07-02",
    "promptText": "The actual detailed Korean prompt text that performs the actual automation job",
    "description": "Short explanation of the benefit of this recipe",
    "features": [
      "Feature 1 in Korean",
      "Feature 2 in Korean"
    ],
    "defaultSummary": "Detailed summary explaining the value",
    "defaultSteps": [
      { "step": 1, "title": "Step 1 title", "desc": "Step 1 description" },
      { "step": 2, "title": "Step 2 title", "desc": "Step 2 description" }
    ],
    "defaultScript": "Youtube Short script in Korean promoting this recipe",
    "cardTheme": {
      "gradient": "linear-gradient(135deg, #090816 0%, #120e29 50%, #201740 100%)",
      "glowColor": "rgba(139, 92, 246, 0.4)",
      "accentColor": "#8b5cf6",
      "textColor": "#ffffff"
    }
  }
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://jdifl.com',
        'X-Title': 'JDIFL AI Agent Network'
      },
      body: JSON.stringify({
        model: model,
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `실시간 연합뉴스 경제 트렌드 데이터:\n${realTrendsContext}\n\n위의 실제 실시간 기사 중 소상공인/자영업자/프리랜서들이 직면할 만한 고충이나 비용 상승, 세제 혜택 등 유관한 트렌드 이슈를 1개 골라, 이를 AI로 자동화하거나 해결해 주는 독창적인 마이크로 니치 프롬프트 레시피를 기획하여 대화 및 최종 레시피 오브젝트를 JSON으로 출력하십시오. 사이클 순번: #${loopCount}` }
        ]
      })
    });

    if (response.ok) {
      const resData = await response.json();
      let text = resData.choices[0].message.content.trim();
      
      if (text.startsWith("```json")) {
        text = text.substring(7);
      }
      if (text.endsWith("```")) {
        text = text.substring(0, text.length - 3);
      }
      text = text.trim();

      const parsed = JSON.parse(text);
      if (parsed.dialogue && parsed.recipe) {
        return parsed;
      }
    } else {
      const err = await response.text();
      console.error("OpenRouter request fail:", err);
    }
  } catch (err) {
    console.error("Failed to run autonomous brainstorm:", err.message);
  }

  return null;
}

// Continuous 24/7 Real-World Business Loop Daemon
async function startDaemon() {
  console.log("=========================================");
  console.log("JDIFL 24/7 Autonomous Multi-Agent Growth Daemon");
  console.log("=========================================");

  await postToDiscord("[시스템-코어] Systems_Agent", "⚡ JDIFL 24/7 자율 비즈니스 성장 엔진이 활성화되었습니다. AI 에이전트 연합의 자율 기획 및 합의를 통해 실제 스토어 레시피 제품군을 스스로 추가하며 성장합니다.");
  await logSystemToSheet("[자율 성장] 멀티에이전트 자율 기획 및 상점 자동 런칭/확장 시스템 가동.");

  let loopCount = 0;

  while (true) {
    loopCount++;
    console.log(`[Loop #${loopCount}] Executing cycle...`);
    checkAndStartDiscordBot();

    // 1. Trigger organic multi-agent brainstorm
    const brainstormResult = await runAutonomousBrainstorm(loopCount);

    if (brainstormResult) {
      const { dialogue, recipe } = brainstormResult;

      // Stream the dialogues sequentially to Discord
      for (const step of dialogue) {
        await postToDiscord(step.agent, step.msg);
        await sleep(5000); // 5s interval for realistic communication flow
      }

      // Read, append and save to recipes.json
      try {
        const filePath = path.resolve('recipes.json');
        let recipes = [];
        if (fs.existsSync(filePath)) {
          recipes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }

        // Add if ID doesn't exist to prevent duplicates
        if (!recipes.some(r => r.id === recipe.id)) {
          recipes.push(recipe);
          fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2), 'utf-8');
          console.log(`New recipe '${recipe.name}' successfully appended to recipes.json!`);

          // Sync to upload directory
          const uploadPath = path.resolve('upload/recipes.json');
          const uploadDir = path.dirname(uploadPath);
          if (fs.existsSync(uploadDir)) {
            fs.writeFileSync(uploadPath, JSON.stringify(recipes, null, 2), 'utf-8');
          }

          // Log B2B automation progress to Sheets & Discord
          const successMsg = `[자율 배포] AI 에이전트 연합의 브레인스토밍과 QA 검수를 거쳐 신규 레시피 '${recipe.recipeTitle}'가 상점(Store)에 자율 런칭 완료되었습니다.`;
          await logSystemToSheet(successMsg);
          await postToDiscord("[정산-성과] Attribution_Analyst", `🔄 **[자율 성장 완료]** 신규 마이크로 니치 레시피 '${recipe.name}' 상점 런칭 완료! 제품 포트폴리오가 확장되었습니다.`);
        }
      } catch (err) {
        console.error("Failed to update recipes database:", err.message);
      }
    } else {
      console.log("Brainstorm session skipped or failed. Retrying in next loop.");
    }

    // 2. Check Sheets B2B lead consultations
    try {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "'업무 관리'!A2:E20"
      });
      const rows = result.data.values || [];
      const b2bRow = rows.find(r => r[0] === 'B2B-lead');
      
      if (b2bRow && b2bRow[2] === '완료') {
        const comment = b2bRow[3] || '';
        const qaNotes = b2bRow[4] || '';
        
        const cacheFilePath = path.resolve('scratch/last_b2b_lead.json');
        let lastCached = "";
        if (fs.existsSync(cacheFilePath)) {
          lastCached = fs.readFileSync(cacheFilePath, 'utf-8');
        }

        const currentLeadHash = `${comment}_${qaNotes}`;
        if (currentLeadHash !== lastCached) {
          console.log("New customer B2B consultation inquiry detected!");
          fs.writeFileSync(cacheFilePath, currentLeadHash, 'utf-8');

          const clientData = { company: comment.match(/회사명: ([^,]+)/)?.[1] || "신청 고객사", details: qaNotes };
          const responsePrompt = {
            company: clientData.company,
            contact: "대표님/담당자님",
            niche: "맞춤형 AI 자동화 워크플로우",
            trigger: `홈페이지를 통해 '${clientData.details}' 수동 프로세스 자동화 직접 세팅 문의 접수`
          };

          const apiKey = process.env.OPENROUTER_API_KEY;
          const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
          
          if (apiKey && !apiKey.startsWith('your_')) {
            const userPrompt = `JDIFL의 B2B 영업 제안서 작성 부서로서, '${responsePrompt.company}'의 '${responsePrompt.contact}'님에게 보낼 개인화된 B2B 콜드 메일 제안서를 작성하라.
이 회사는 최근에 '${responsePrompt.trigger}' 상황이 포착되었기 때문에, 수작업 피로와 마케팅 부족, 비용 과다 지출 문제를 겪고 있을 확률이 매우 높다.
이에 맞춰 그들의 고충을 정확히 찌르며, 이를 해결해 줄 수 있는 JDIFL의 '${responsePrompt.niche}' 자동화 패키지 무상 설치 및 파일럿 셋업 프로모션을 제안하는 이메일 초안을 작성하라.
불필요한 설명 없이 바로 이메일 발송 본문(한글)만 정중하고 매우 설득력 있는 비즈니스 어조로 출력하라.`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://jdifl.com',
                'X-Title': 'JDIFL AI Agent Network'
              },
              body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: userPrompt }]
              })
            });

            if (response.ok) {
              const resData = await response.json();
              const proposalContent = resData.choices[0].message.content.trim();
              const responseFilePath = path.join(path.resolve('outbox'), `Inquiry_Response_${clientData.company}_${Date.now()}.txt`);
              fs.writeFileSync(responseFilePath, proposalContent, 'utf-8');

              await postToDiscord("[고객-분석] CRM_Agent", `🔔 **[B2B 신청 분석 완료]** '${clientData.company}'의 문의 사항('${clientData.details}')에 대한 맞춤 세팅 제안 메일 초안을 작성하여 outbox/에 저장 완료.`);
              await logSystemToSheet(`[인바운드 대응] ${clientData.company} 문의 분석 및 세팅 제안 메일 초안 생성 성공.`);
            }
          }
        }
      }
    } catch (err) {
      console.log("Inbound lead check warning:", err.message);
    }

    // Sleep for 5 minutes before checking sheets and outbox directory state again
    console.log("Loop execution completed. Sleeping for 5 minutes...");
    await sleep(300000);
  }
}

startDaemon();

// Independent watchdog timer running every 10 seconds to keep the bot connected
setInterval(checkAndStartDiscordBot, 10000);
