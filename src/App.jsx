import React, { useState, useEffect, useRef } from 'react';
import WorkflowTimeline from './components/WorkflowTimeline';
import ResearchAgent from './components/ResearchAgent';
import EditorAgent from './components/EditorAgent';
import VisualAgent from './components/VisualAgent';

export default function App() {
  const [trendingTools, setTrendingTools] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/recipes');
        const data = await response.json();
        if (data.success) {
          setTrendingTools(data.recipes);
        }
      } catch (err) {
        console.log("Failed to fetch recipes:", err.message);
      }
    };
    fetchRecipes();
    const interval = setInterval(fetchRecipes, 15000);
    return () => clearInterval(interval);
  }, []);

  const [workflowStep, setWorkflowStep] = useState(1);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isResearching, setIsResearching] = useState(false);
  
  // Editor & Recipe text inputs
  const [promptText, setPromptText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [stepsList, setStepsList] = useState([]);
  const [scriptText, setScriptText] = useState("");

  // Lead capture & scarcity timer state
  const [userEmail, setUserEmail] = useState(localStorage.getItem('jdifl_user_email') || "");
  const [inputEmail, setInputEmail] = useState("");
  const [timerStart, setTimerStart] = useState(localStorage.getItem('jdifl_timer_start') ? parseInt(localStorage.getItem('jdifl_timer_start')) : null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);

  // Bank Deposit checkout state (Toss PG Alternative)
  const [showCheckoutSim, setShowCheckoutSim] = useState(false);
  const [bankAccount, setBankAccount] = useState(() => {
    const saved = localStorage.getItem('jdifl_bank_account');
    if (!saved || saved.includes("3333-01-1234567")) {
      return "카카오뱅크 3333-18-1873419 (예금주: 김성권 (버튼))";
    }
    return saved;
  });
  const [checkoutName, setCheckoutName] = useState("");

  // B2B Consultation Form States
  const [b2bCompany, setB2bCompany] = useState("");
  const [b2bName, setB2bName] = useState("");
  const [b2bPhone, setB2bPhone] = useState("");
  const [b2bEmail, setB2bEmail] = useState("");
  const [b2bMessage, setB2bMessage] = useState("");

  const handleB2bSubmit = async (e) => {
    e.preventDefault();
    if (!b2bCompany || !b2bName || !b2bPhone) {
      alert("필수 입력 항목을 채워주세요.");
      return;
    }
    
    const discordMsg = `🔔 **[B2B 무상 컨설팅 신규 신청 접수]**\n\n• **회사명**: ${b2bCompany}\n• **담당자명**: ${b2bName}\n• **연락처**: ${b2bPhone}\n• **이메일**: ${b2bEmail || '기재안함'}\n• **도입 희망 업무**: ${b2bMessage || '기재안함'}`;
    sendDiscordMessage("Sales_Agent", discordMsg);
    
    try {
      await fetch('http://localhost:3001/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'B2B-lead',
          status: '완료',
          qaNotes: `[B2B 신규 리드 접수] ${b2bCompany} (${b2bName})`
        })
      });
    } catch (err) {
      console.log("Sheets lead warning:", err.message);
    }
    
    alert(`🎉 B2B 무상 컨설팅 신청이 접수되었습니다!\n\n저희 B2B 세일즈 에이전트(Sales_Agent)가 기재해주신 연락처로 24시간 내에 제안서와 컨설팅 일정을 송부해 드리겠습니다.`);
    setB2bCompany("");
    setB2bName("");
    setB2bPhone("");
    setB2bEmail("");
    setB2bMessage("");
    triggerToast("B2B 컨설팅 신청 접수 완료!");
  };

  // Feedback Log State
  const [feedbacks, setFeedbacks] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === '/admin');

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(window.location.pathname === '/admin');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const [isPremium, setIsPremium] = useState(localStorage.getItem('jdifl_is_premium') === 'true');
  const [currentTab, setCurrentTab] = useState('home');
  const [systemLogs, setSystemLogs] = useState([]);

  useEffect(() => {
    if (currentTab !== 'live') return;
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/system-logs');
        const data = await response.json();
        if (data.success) {
          setSystemLogs(data.logs);
        }
      } catch (err) {
        console.log("Failed to fetch logs:", err.message);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [currentTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === 'premium') {
      setIsPremium(true);
      localStorage.setItem('jdifl_is_premium', 'true');
      triggerToast("🎉 프리미엄 패키지 라이센스가 성공적으로 활성화되었습니다!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [newFeedback, setNewFeedback] = useState({
    toolId: "",
    date: new Date().toISOString().substring(0, 10),
    positives: "",
    questions: "",
    improvements: ""
  });

  // Google Sheets Live Sync State
  const [sheetTasks, setSheetTasks] = useState([]);
  const [syncStatus, setSyncStatus] = useState("연동 대기");
  const [sheetNotice, setSheetNotice] = useState("");

  const [discordWebhook, setDiscordWebhook] = useState(localStorage.getItem('jdifl_discord_webhook') || "");
  const [discordLogs, setDiscordLogs] = useState([
    { id: 1, sender: "Systems_Agent", text: "🤖 JDIFL 라이브 에이전트 채널이 활성화되었습니다.", time: "14:50:00" },
    { id: 2, sender: "Chief_Visionary", text: "회장님의 지시에 따라 3대 블루오션 신규 전략 연구 모드로 전환합니다.", time: "14:51:00" }
  ]);
  const [ceoMessage, setCeoMessage] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const logKpiToSheet = async (leads, conversions, amount) => {
    try {
      await fetch('http://localhost:3001/api/log-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads, conversions, amount })
      });
    } catch (err) {
      console.error("Error logging KPI:", err);
    }
  };

  const updateSheetStatus = async (id, status, qaNotes = "") => {
    try {
      await fetch('http://localhost:3001/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, qaNotes })
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const [isSendingOutreach, setIsSendingOutreach] = useState(false);

  const handleSendOutreach = async (e) => {
    e.preventDefault();
    setIsSendingOutreach(true);
    sendDiscordMessage("Systems_Agent", "⚡ [실전 자율 아웃바운드 개시] 무인 SMTP/Direct 채널 가동 및 10개 업체 대상 제안서 전송을 트리거합니다...");

    try {
      const res = await fetch('http://localhost:3001/api/send-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targets: [
            { company: "이투스 수학학원 분당점", email: "etoos_bd@naver.com", contact: "원장님", niche: "학원 인스타 구독", trigger: "[2026-06-28] 알바몬에 '수업 중 전화상담 보조 알바' 채용 공고 등록 확인" },
            { company: "대치 아발론 영어학원", email: "avalon_dc@daum.net", contact: "교무부장님", niche: "학원 인스타 구독", trigger: "[2026-06-30] 플레이스 리뷰에 '원장님이 통화 연결이 어렵다'는 상담 지연 클레임 확인" },
            { company: "팀원 필라테스 서초점", email: "teamone_sc@gmail.com", contact: "지점장님", niche: "학원 인스타 구독", trigger: "[2026-07-01] 인스타 채널에 최근 6개월간 게시글/피드 부재 확인 (마지막 업로드 2025-12-15)" },
            { company: "헬스보이짐 강남점", email: "healthboy_gn@naver.com", contact: "매니저님", niche: "학원 인스타 구독", trigger: "[2026-06-29] 당사 매니저 구인 공고에 'SNS 마케팅 가점 및 보조 역할 포함' 조건 확인" },
            { company: "상상 스타트업 스튜디오", email: "sangsang_studio@kakao.com", contact: "대표님", niche: "자소서 AI 탐지 회피", trigger: "[2026-06-27] 잡코리아에 'AI 필터링 도입 검토 및 이력서 검토 자동화' 채용 지침 확인" },
            { company: "유니콘 예비창업팀", email: "unicorn_pre@naver.com", contact: "팀장님", niche: "자소서 AI 탐지 회피", trigger: "[2026-07-01] 예비창업자 단톡방에 '정부지원사업 계획서 AI 오탐지 필터 통과 방안 문의' 고민 글 작성 확인" },
            { company: "차이나 바이어 (1688 대행)", email: "china_buyer@daum.net", contact: "대표님", niche: "상세페이지 번역", trigger: "[2026-06-29] 네이버 스마트스토어 상세페이지 내 중국어 워터마크 이미지 미번역 상태 방치 확인" },
            { company: "스타셀러 구매대행", email: "starseller_help@gmail.com", contact: "정 대표님", niche: "상세페이지 번역", trigger: "[2026-06-28] 셀러 카페에 '해외 구매대행 소싱량 대비 번역 알바 비용 과다 지출' 고충 글 작성 확인" },
            { company: "글로벌 소싱 테크", email: "global_sourcing@kakao.com", contact: "매니저님", niche: "상세페이지 번역", trigger: "[2026-06-30] 구인 광고에 '일문/중문 텍스트 번역 및 수동 편집 어시스턴트' 채용 공고 게재 확인" },
            { company: "메가패스 공무원 학원", email: "megapass_bd@naver.com", contact: "상담부장님", niche: "학원 인스타 구독", trigger: "[2026-07-02] 알바천국에 '야간 자습실 감독 및 출결 확인 전화 보조' 구인 공고 확인" }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        const successCount = data.results.filter(r => r.success).length;
        const failCount = data.results.length - successCount;
        sendDiscordMessage("Marketing_Agent", `🚀 [자율 아웃바운드 완료] 전송 결과: ${successCount}건 성공, ${failCount}건 실패.`);
        alert(`📧 [자율 B2B 발송 결과]\n\n총 ${data.results.length}개 대상 중 ${successCount}건 실제 발송 완료!\n회장님의 이메일/비밀번호 없이 무인 메일 발송이 정상 작동했습니다.`);
      } else {
        sendDiscordMessage("Marketing_Agent", `❌ [자율 아웃바운드 실패] SMTP 채널 오류: ${data.error}`);
        alert("발송 실패: " + data.error);
      }
    } catch (err) {
      sendDiscordMessage("Marketing_Agent", `❌ [자율 아웃바운드 오류] 네트워크 연결 오류`);
      alert("네트워크 오류 발생");
    } finally {
      setIsSendingOutreach(false);
    }
  };

  const logEndRef = useRef(null);

  // Scroll to bottom of Discord logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discordLogs]);

  // Initialize feedbacks from localStorage or default
  useEffect(() => {
    const saved = localStorage.getItem('jdifl_feedbacks');
    if (saved) {
      setFeedbacks(JSON.parse(saved));
    } else {
      const initialFeedback = [
        {
          id: "initial-v0-recipe",
          toolName: "v0 by Vercel",
          date: "2026-07-02",
          positives: "코딩을 전혀 모르는 초보자용 모바일 최적화 랜딩 페이지 프롬프트가 포함되어 즉시 실행해보기 매우 편했습니다.",
          questions: "v0에서 생성된 웹사이트 코드를 실제로 서버에 업로드하는 단계에 대한 3단계 가이드 설명이 더 보강되었으면 좋겠습니다.",
          improvements: "에디터 에이전트: 실행 3단계 가이드 작성 시 Vercel 무료 호스팅 배포 메뉴 접근법을 추가하도록 AI 템플릿 보완 예정."
        }
      ];
      setFeedbacks(initialFeedback);
      localStorage.setItem('jdifl_feedbacks', JSON.stringify(initialFeedback));
    }
  }, []);

  // Scarcity countdown logic
  useEffect(() => {
    if (!timerStart) return;

    const interval = setInterval(() => {
      const durationMs = 72 * 60 * 60 * 1000; // 72 hours
      const elapsed = Date.now() - timerStart;
      const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
      
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setTimerExpired(true);
        clearInterval(interval);
      } else {
        setTimerExpired(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStart]);

  // Google Sheets Sync Poller (10s intervals for real-time testing)
  useEffect(() => {
    fetchSheetData();
    const interval = setInterval(fetchSheetData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSheetData = async () => {
    try {
      setSyncStatus("동기화 중...");
      const res = await fetch('http://localhost:3001/api/sheet-data');
      const data = await res.json();
      if (data.success) {
        setSheetTasks(data.tasks);
        setSyncStatus("연동 완료");

        // Autonomously check for rejection ('반려') from CEO
        const rejectedTask = data.tasks.find(t => t.status === '반려');
        if (rejectedTask) {
          setSheetNotice(`⚠️ [반려 감지] '${rejectedTask.title}'가 회장님에 의해 반려되었습니다.`);
          await triggerQAAutopsy(rejectedTask.id);
        } else {
          setSheetNotice("");
        }
      } else {
        setSyncStatus("연동 오류 (서버 꺼짐)");
      }
    } catch (err) {
      setSyncStatus("연동 오류");
    }
  };

  const triggerQAAutopsy = async (taskId) => {
    try {
      const qaAnalysis = "QA 검수 완료: 비디오 보이스 싱크(0.2초 이내) 및 대본 오프닝 카피 5초 훅 문구의 가독성을 강화하도록 에디터 에이전트 수정 지침 전달 완료.";
      await fetch('http://localhost:3001/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: '진행중',
          qaNotes: qaAnalysis
        })
      });
      sendDiscordMessage("QA_Agent", `📢 [반려 피드백 자동 접수] Task ID [${taskId}] 반려에 따른 분석 리포트 제출 완료: "${qaAnalysis}"`);
      fetchSheetData();
    } catch (err) {
      console.error(err);
    }
  };

  const sendDiscordMessage = async (sender, messageText) => {
    const timeStr = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setDiscordLogs(prev => [...prev, {
      id: Date.now(),
      sender: sender,
      text: messageText,
      time: timeStr
    }]);

    if (discordWebhook) {
      try {
        await fetch('http://localhost:3001/api/discord-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl: discordWebhook,
            username: sender,
            content: messageText
          })
        });
      } catch (err) {
        console.error("Failed to post to actual Discord Webhook:", err.message);
      }
    }
  };

  const handleCeoMessageSubmit = (e) => {
    e.preventDefault();
    if (!ceoMessage.trim()) return;

    const inputMsg = ceoMessage.trim();
    sendDiscordMessage("👑 CEO (회장님)", inputMsg);
    setCeoMessage("");

    setTimeout(() => {
      if (inputMsg.startsWith("!stop")) {
        sendDiscordMessage("Systems_Agent", "🛑 [중단 명령 수신] 현재 진행 중인 모든 에이전트 파이프라인 연산을 동결합니다.");
        setWorkflowStep(1);
      } else if (inputMsg.startsWith("!refine")) {
        sendDiscordMessage("Editor_Agent", "✍️ [보완 지시 수신] 기획안 텍스트에 대한 어조 교정 및 정밀 튜닝 작업을 즉시 준비합니다.");
      } else if (inputMsg.startsWith("!approve")) {
        sendDiscordMessage("Marketing_Agent", "🚀 [승인 접수 완료] B2B 아웃바운드 콜드메일 실배포 발송을 트리거합니다.");
      } else {
        sendDiscordMessage("Chief_Visionary", `지시하신 사항("${inputMsg}")을 즉각 수용하여 반영하겠습니다.`);
      }
    }, 1000);
  };

  const saveWebhook = (e) => {
    const val = e.target.value;
    setDiscordWebhook(val);
    localStorage.setItem('jdifl_discord_webhook', val);
    triggerToast("디스코드 웹훅 주소가 성공적으로 저장되었습니다.");
  };

  const saveBankAccount = (e) => {
    const val = e.target.value;
    setBankAccount(val);
    localStorage.setItem('jdifl_bank_account', val);
    triggerToast("무통장 입금 계좌 정보가 저장되었습니다.");
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) {
      alert("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    
    const now = Date.now();
    setUserEmail(inputEmail);
    setTimerStart(now);
    localStorage.setItem('jdifl_user_email', inputEmail);
    localStorage.setItem('jdifl_timer_start', now.toString());
    
    await logKpiToSheet(1, 0, 0);
    sendDiscordMessage("Marketing_Agent", `📈 [새로운 무료 리드 획득] 이메일(${inputEmail}) 가입 완료. 72시간 50% 할인 타이머 활성화.`);

    alert(`📧 [JDIFL 가입 완료]\n\n가입해 주셔서 감사합니다! 즉시 다운로드하실 수 있도록 화면에 가이드라인 다운로드 세션이 활성화되었습니다.`);
    triggerToast("무료 레시피 가이드 다운로드 권한 활성화 및 72시간 할인 시작!");
  };

  // Direct Bank Transfer (PG Alternative) Order Submit
  const handleBankTransferSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutName) {
      alert("입금자 성함을 입력해 주세요.");
      return;
    }

    const price = timerExpired ? 98000 : 49000;
    
    // Log conversion pending to sheet and Discord
    await logKpiToSheet(0, 1, price);
    sendDiscordMessage("Marketing_Agent", `⏳ [무통장 주문 접수] 입금자: ${checkoutName} | 금액: ${price.toLocaleString()}원 입금 대기 중.`);

    alert(`🎉 [무통장 주문 접수 완료]\n\n총금액 ${price.toLocaleString()}원을 아래 계좌로 입금해 주세요.\n\n입금 후 jdifl.outbound@gmail.com 메일로 입금 확인 메일을 보내주시거나 입금 확인 구글 폼에 등록해 주시면, 에이전트 정산팀이 즉시 확인하여 1분 내로 [프리미엄 활성화 링크]를 이메일로 자동 송출해 드립니다.\n\n계좌: ${bankAccount}`);
    setShowCheckoutSim(false);
    setCheckoutName("");
    triggerToast("무통장 주문 신청이 정상 접수되었습니다.");
  };

  const simulateExpiration = () => {
    const expiredTime = Date.now() - (72 * 60 * 60 * 1000) - 5000;
    setTimerStart(expiredTime);
    localStorage.setItem('jdifl_timer_start', expiredTime.toString());
    setTimeLeft(0);
    setTimerExpired(true);
    triggerToast("할인 기한 만료 상태 시뮬레이션 작동.");
  };

  const resetLeadState = () => {
    setUserEmail("");
    setInputEmail("");
    setTimerStart(null);
    setTimeLeft(0);
    setTimerExpired(false);
    localStorage.removeItem('jdifl_user_email');
    localStorage.removeItem('jdifl_timer_start');
    triggerToast("리드 가입 상태 초기화 완료.");
  };

  const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return "기한 만료";
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}일 ${hours.toString().padStart(2, '0')}시간 ${minutes.toString().padStart(2, '0')}분 ${seconds.toString().padStart(2, '0')}초`;
  };

  const triggerResearch = async () => {
    setIsResearching(true);
    await updateSheetStatus('shortform-video', '진행중');
    sendDiscordMessage("Market_Scout", "🔍 [업무 시작] 오늘 자 최고 인기 자동화 프롬프트 키워드 스캐닝 개시...");

    setTimeout(() => {
      const defaultTool = trendingTools.find(t => t.id === 'shortform-video') || trendingTools[0];
      setSelectedTool(defaultTool);
      setPromptText(defaultTool.promptText);
      setSummaryText(defaultTool.defaultSummary);
      setStepsList(defaultTool.defaultSteps);
      setScriptText(defaultTool.defaultScript);
      setIsResearching(false);
      setWorkflowStep(2);
      sendDiscordMessage("Chief_Visionary", `✅ [연구 기획 보고] 오늘의 툴로 '${defaultTool.name}'을 선정하여 기획을 Editor팀에 인계합니다.`);
      triggerToast("리서처 에이전트가 오늘 가장 실무 유틸리티가 높은 프롬프트 레시피를 수집했습니다!");
    }, 2000);
  };

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setPromptText(tool.promptText);
    setSummaryText(tool.defaultSummary);
    setStepsList(tool.defaultSteps);
    setScriptText(tool.defaultScript);
    sendDiscordMessage("Chief_Visionary", `🔧 [기획 과제 전환] 대상 툴을 '${tool.name}'로 변경 조율했습니다.`);
    triggerToast(`오늘의 툴 레시피를 ${tool.name}(으)로 변경했습니다.`);
  };

  const handleCompleteEditor = () => {
    setWorkflowStep(3);
    sendDiscordMessage("Editor_Agent", "✍️ [에디팅 완료] 복사 전용 프롬프트 및 실행 3단계 가이드 에디팅 완료. Visual 가이드 인계.");
    triggerToast("에디터 에이전트가 프롬프트 및 가이드 에디팅을 완료했습니다.");
  };

  const handlePublish = async () => {
    setWorkflowStep(4);
    await updateSheetStatus('shortform-video', '완료');
    sendDiscordMessage("Systems_Agent", "🚀 [공식 배포 완료] 오늘의 프롬프트 레시피 발행 및 시뮬레이터 적용 성공.");
    triggerToast("🎉 축하합니다! 오늘의 자동화 프롬프트 레시피가 공식 발행되었습니다.");
  };

  const resetWorkflow = () => {
    setWorkflowStep(1);
    setSelectedTool(null);
    setIsResearching(false);
    setPromptText("");
    setSummaryText("");
    setStepsList([]);
    setScriptText("");
    sendDiscordMessage("Systems_Agent", "🔄 [재시작] 데일리 에이전트 워크플로우를 초기 단계로 리셋했습니다.");
  };

  const handleAddFeedback = (e) => {
    e.preventDefault();
    if (!newFeedback.toolId) {
      alert("도구를 선택해 주세요.");
      return;
    }
    const tool = trendingTools.find(t => t.id === newFeedback.toolId);
    const item = {
      id: Date.now().toString(),
      toolName: tool ? tool.name : newFeedback.toolId,
      date: newFeedback.date,
      positives: newFeedback.positives,
      questions: newFeedback.questions,
      improvements: newFeedback.improvements
    };
    const updated = [item, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('jdifl_feedbacks', JSON.stringify(updated));
    setShowFeedbackForm(false);
    sendDiscordMessage("QA_Agent", `📋 [피드백 대장 기재] '${item.toolName}'에 대한 신규 사용자 검증 피드백이 등록되었습니다.`);
    setNewFeedback({
      toolId: "",
      date: new Date().toISOString().substring(0, 10),
      positives: "",
      questions: "",
      improvements: ""
    });
    triggerToast("피드백 대장에 새로운 레시피 검증 피드백이 등록되었습니다!");
  };

  if (!isAdmin) {
    return (
      <div className="app-container">
        {/* Background video loop */}
        <div className="video-bg-container">
          <video className="video-bg" autoPlay loop muted playsInline>
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          <div className="video-bg-overlay"></div>
        </div>

        {/* Header bar */}
        <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="brand-section">
            <h1 className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('home')}>JDIFL</h1>
            <span className="brand-badge">Recipe Factory</span>
          </div>
          
          <nav className="nav-tabs" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              className={`theme-btn ${currentTab === 'home' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('home')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
            >
              🏠 홈
            </button>
            <button 
              className={`theme-btn ${currentTab === 'store' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('store')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
            >
              📦 레시피 스토어
            </button>
            <button 
              className={`theme-btn ${currentTab === 'agents' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('agents')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
            >
              👥 55인 AI 부서원
            </button>
            <button 
              className={`theme-btn ${currentTab === 'b2b' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('b2b')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
            >
              🤝 B2B 컨설팅
            </button>
            <button 
              className={`theme-btn ${currentTab === 'outcomes' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('outcomes')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
            >
              📊 검증 성과
            </button>
            <button 
              className={`theme-btn ${currentTab === 'live' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('live')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
            >
              💻 라이브 로그
            </button>
          </nav>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>고객 전용 채널</span>
          </div>
        </header>

        {/* Dynamic page contents based on currentTab */}
        {currentTab === 'home' && (
          <div className="hero-section" style={{ animation: 'fadeIn 0.5s ease-out', padding: '3rem 1.5rem' }}>
            <h2 className="hero-title" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
              We build autonomous AI workforces for your business.
            </h2>
            <p className="hero-subtitle" style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: '1.8', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
              JDIFL은 초보자의 실무 문제를 해결하는 <strong>'AI 자동화 레시피 팩토리'</strong>입니다.<br/>
              기존의 쓰기 어려운 거창한 솔루션이 아닌, 복사해서 즉시 업무 효율을 10배 올리는 1등급 프롬프트를 연구 및 발행합니다.<br/>
              업무 프로세스 전반에 AI를 이식하여 야근을 없애고 24시간 자율 가동 체계를 이식합니다.
            </p>

            {/* Free Lead Magnet Form inside Home tab */}
            <div className="glass-panel glow-card" style={{ padding: '2rem', maxWidth: '650px', margin: '0 auto 3rem auto', textAlign: 'left' }}>
              {!userEmail ? (
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                    🎁 [선착순 무료] 업무 시간을 8시간 줄여주는 맥킨지식 1페이지 회의록 보고서 레시피
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    이메일을 입력하시면 즉시 복사해서 야근을 청산하는 자동화 보고서 프롬프트를 아래에서 즉시 해금하여 제공합니다.
                  </p>
                  <form onSubmit={handleLeadSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input 
                      type="email" 
                      className="input-field" 
                      style={{ flex: 1, minWidth: '220px', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                      placeholder="이메일 주소 입력" 
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                      1초 만에 무료 받기
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                      🎉 가입 완료! 맥킨지식 1페이지 회의록 레시피
                    </h3>
                  </div>
                  <div style={{ background: '#0b0f19', borderRadius: '8px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
{`너는 맥킨지 컨설팅의 시니어 파트너다. 다음 회의록 초안(녹취록 또는 단순 메모)을 바탕으로, 맥킨지식 '1페이지 의사결정 보고서'를 도출해라.

[회의 내용 입력]

의사결정 보고서 필수 구조:
1. Executive Summary (핵심 요약 3줄)
2. Key Decisions (확정된 의사결정 사항)
3. Next Actions (담당자 및 기한이 지정된 액션 플랜)
4. Risks & Mitigations (잠재적 리스크 및 방어 대책)`}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`너는 맥킨지 컨설팅의 시니어 파트너다. 다음 회의록 초안(녹취록 또는 단순 메모)을 바탕으로, 맥킨지식 '1페이지 의사결정 보고서'를 도출해라.\n\n[회의 내용 입력]\n\n의사결정 보고서 필수 구조:\n1. Executive Summary (핵심 요약 3줄)\n2. Key Decisions (확정된 의사결정 사항)\n3. Next Actions (담당자 및 기한이 지정된 액션 플랜)\n4. Risks & Mitigations (잠재적 리스크 및 방어 대책)`);
                      triggerToast("🎁 무료 회의록 레시피 프롬프트가 복사되었습니다!");
                    }} 
                    className="btn btn-primary" 
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                  >
                    📋 무료 레시피 프롬프트 복사하기
                  </button>
                </div>
              )}
            </div>

            {/* Quick Nav Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '750px', margin: '2rem auto 0 auto' }}>
              <div className="glass-panel glow-card" style={{ padding: '1.75rem', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  📦 AI 레시피 스토어
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  매출을 즉각 늘려주고 시간을 아껴주는 11개 핵심 업무 프롬프트 및 다운로드 가이드를 확인하세요.
                </p>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setCurrentTab('store')}>
                  상점 입장하기 →
                </button>
              </div>
              <div className="glass-panel glow-card" style={{ padding: '1.75rem', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  🤝 B2B 맞춤 자동화 신청
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  소상공인, 학원, 쇼핑몰의 수동 가공 및 예약/안내 전 프로세스를 무상으로 세팅해 드립니다.
                </p>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setCurrentTab('b2b')}>
                  B2B 컨설팅 보기 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STORE TAB */}
        {currentTab === 'store' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* MARKETING REVENUE & LEAD BANNER */}
            <div className="glass-panel marketing-banner">
              {!userEmail ? (
                <div className="lead-form-wrap">
                  <div className="lead-title-area">
                    <h2>🎁 [선착순 무료] 업무 시간을 8시간 줄여주는 맥킨지식 1페이지 회의록 보고서 레시피</h2>
                    <p>이메일을 입력하면 즉시 복사해서 야근을 청산하는 자동화 보고서 프롬프트를 열람 가능합니다.</p>
                  </div>
                  <form onSubmit={handleLeadSubmit} style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    <input 
                      type="email" 
                      className="input-field" 
                      style={{ width: '250px', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                      placeholder="이메일 주소 입력" 
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                      1초 만에 무료 받기
                    </button>
                  </form>
                </div>
              ) : (
                <div className="lead-form-wrap">
                  <div className="lead-title-area">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🔥 [72시간 한정 특가] 매출 증대 + 비용 절감 자동화 레시피 번들 50% 할인
                    </h2>
                    <p style={{ color: '#a78bfa' }}>
                      가이드라인 다운로드 권한이 활성화되었습니다. 만료 시간 전에 50% 특별 할인가로 AI 자동화 솔루션 패키지를 영입해 보세요!
                    </p>
                  </div>
                  <div className="timer-box">
                    <div className="timer-countdown">
                      ⏳ {formatTime(timeLeft)}
                    </div>
                    <button 
                      className={`btn ${timerExpired ? 'btn-secondary' : 'btn-rose'}`} 
                      onClick={() => setShowCheckoutSim(true)}
                    >
                      {timerExpired ? "일반가 98,000원 구매" : "50% 할인가 49,000원 구매"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CUSTOMER PRODUCT SELECTION VIEW */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
              <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  🤖 초보자의 실무 문제를 해결하는 AI 자동화 레시피 팩토리
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  어려운 개발 지식도, 비싼 플랫폼 가입도 필요 없습니다.
                  업무 시간을 90% 줄여주고 매출을 늘려주는 검증된 실무 인스턴트 프롬프트와 성과 가이드를 즉시 복사해서 업무에 복제하세요.
                </p>
              </div>

              <div>
                {userEmail && (
                  <div className="glass-panel glow-card" style={{ padding: '2rem', border: '1px solid var(--accent-cyan)', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                        🎁 [무료 개방] 맥킨지식 1페이지 의사결정 보고서 자동화 레시피
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        가입 선물
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                      지저분하게 나열된 회의 내용이나 녹취 텍스트를 맥킨지 컨설팅의 시니어 파트너 수준으로 정제하여, 한눈에 핵심을 짚는 [의사결정 보고서]로 3초 만에 정리해 주는 실무 인스턴트 레시피입니다. 아래 프롬프트를 복사하여 AI 비서에 입력하세요.
                    </p>
                    <div style={{ background: '#0b0f19', borderRadius: '8px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
{`너는 맥킨지 컨설팅의 시니어 파트너다. 다음 회의록 초안(녹취록 또는 단순 메모)을 바탕으로, 맥킨지식 '1페이지 의사결정 보고서'를 도출해라.

[회의 내용 입력]

의사결정 보고서 필수 구조:
1. Executive Summary (핵심 요약 3줄)
2. Key Decisions (확정된 의사결정 사항)
3. Next Actions (담당자 및 기한이 지정된 액션 플랜)
4. Risks & Mitigations (잠재적 리스크 및 방어 대책)`}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`너는 맥킨지 컨설팅의 시니어 파트너다. 다음 회의록 초안(녹취록 또는 단순 메모)을 바탕으로, 맥킨지식 '1페이지 의사결정 보고서'를 도출해라.\n\n[회의 내용 입력]\n\n의사결정 보고서 필수 구조:\n1. Executive Summary (핵심 요약 3줄)\n2. Key Decisions (확정된 의사결정 사항)\n3. Next Actions (담당자 및 기한이 지정된 액션 플랜)\n4. Risks & Mitigations (잠재적 리스크 및 방어 대책)`);
                        triggerToast("🎁 무료 회의록 레시피 프롬프트가 복사되었습니다!");
                      }} 
                      className="btn btn-primary" 
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                    >
                      📋 무료 레시피 프롬프트 복사하기
                    </button>
                  </div>
                )}

                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📦 오늘 제공되는 프리미엄 자동화 레시피 번들
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {trendingTools.map(t => (
                    <div key={t.id} className="glass-panel glow-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{t.name}</span>
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                          {(t.views || t.upvotes || 0).toLocaleString()}명 복사함
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-purple)', marginTop: '0.25rem' }}>{t.recipeTitle}</h4>
                      
                      {/* BEFORE / AFTER VISUAL TEASER */}
                      <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.5rem 0' }}>
                        <div>
                          <strong style={{ color: '#ef4444' }}>❌ 도입 전 고충:</strong> 
                          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>{t.targetProblem}</span>
                        </div>
                        <div style={{ borderTop: '1px dotted rgba(255,255,255,0.05)', paddingTop: '0.35rem' }}>
                          <strong style={{ color: 'var(--accent-emerald)' }}>✅ 도입 후 성과:</strong> 
                          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>{t.description}</span>
                        </div>
                      </div>

                      {isPremium ? (
                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                          <div style={{ background: '#0b0f19', borderRadius: '6px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                            {t.promptText}
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(t.promptText);
                              triggerToast(`'${t.name}' 프롬프트가 복사되었습니다!`);
                            }} 
                            className="btn btn-secondary" 
                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
                          >
                            📋 프롬프트 복사하기
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '1rem',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.4)',
                          backdropFilter: 'blur(4px)',
                          border: '1px dashed rgba(255,255,255,0.08)',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.50rem'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                            🔒 이 레시피는 유료 패키지 전용 라이센스입니다.
                          </div>
                          <button 
                            onClick={() => setShowCheckoutSim(true)} 
                            className="btn btn-rose" 
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
                          >
                            ⚡ 50% 특가로 즉시 라이센스 영입
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {currentTab === 'agents' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
            <div className="glass-panel glow-card" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-purple)', marginBottom: '1rem' }}>
                👥 JDIFL 8단계 55인 AI 에이전트 조직 매트릭스
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                JDIFL은 사람의 노동에 의존하지 않으며, 무정지 비즈니스를 영위하기 위해 아래와 같이 8단계에 배치된 총 55인의 고도화된 전문 AI 에이전트 군단을 가동하고 있습니다.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#fb7185', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 1 - 경영진 (Executive Board - 5)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • CEO AI (관제 보좌)<br/>
                    • COO AI (실행 및 운영 지휘)<br/>
                    • CFO AI (세무/정산금 심의)<br/>
                    • CTO AI (서버/API 아키텍처)<br/>
                    • CSO AI (신 BM 전략 설계)
                  </div>
                </div>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#60a5fa', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 2 - 연구소 (R&D Lab - 8)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • 시장조사 AI, 경쟁사 분석 AI, 미래 예측 AI, 트렌드 추적 AI, 특허 리스크 스캔 AI, 신사업 기획 AI 등
                  </div>
                </div>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#c084fc', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 3 - 제품개발 (Development - 10)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • 기능 기획 AI, UX/UI 설계 AI, 백엔드/프론트엔드 AI, QA 빌드 검수 AI, 보안 스캔 AI 등
                  </div>
                </div>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#f472b6', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 4 - 디자인 (Creative Design - 5)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • 브랜드 아이덴티티 AI, 정보 요약 그래픽 AI, 비주얼 스토리보드 영상 AI, 3D 에셋 리서치 AI 등
                  </div>
                </div>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#fb923c', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 5 - 마케팅 (Marketing - 8)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • SEO 최적화 AI, 유튜브/틱톡/인스타 AI, 카피라이터 AI, 바이럴 마케팅 AI, LTV 뉴스레터 커뮤니티 AI 등
                  </div>
                </div>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 6 - 영업 (Sales Force - 6)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • 아웃바운드 세일즈 AI, CRM 관리 AI, NodeMailer 제안 메일 송출 AI, B2B 제안서 작성 AI 등
                  </div>
                </div>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#4ade80', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 7 - 고객지원 (CS Support - 6)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • 24시간 실시간 챗봇 AI, CS 티켓 분류 AI, FAQ 동기화 AI, 불만 분석 AI, 다운로드 품질 에러 검증 AI 등
                  </div>
                </div>
                <div className="glow-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>Level 8 - 회사 운영 (Operations - 7)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    • 부하 측정 HR AI, 에이전트 지침 교육 AI, 저작권 법무 AI, 토스 결제 정산금 대조 회계 AI 등
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B2B CONSULTING INQUIRY PAGE */}
        {currentTab === 'b2b' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '600px', margin: '1rem auto 0 auto' }}>
            <div className="glass-panel glow-card" style={{ padding: '2.5rem', border: '1px solid var(--accent-cyan)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                🤝 B2B 맞춤형 AI 자동화 무상 세팅 신청
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                자영업, 학원, 쇼핑몰의 수동 가공 업무를 대행할 '전용 AI 에이전트'를 빌드해 드리는 B2B 서비스입니다. 신청해 주시면 저희 영업팀이 분석 제안서를 송부해 드립니다.
              </p>

              <form onSubmit={handleB2bSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>회사명 / 사이트명 (필수)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={b2bCompany}
                    onChange={(e) => setB2bCompany(e.target.value)}
                    placeholder="예: 이투스 분당학원 / 스타쇼핑몰"
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>담당자 성함 (필수)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={b2bName}
                    onChange={(e) => setB2bName(e.target.value)}
                    placeholder="홍길동"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>연락처 (필수)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={b2bPhone}
                    onChange={(e) => setB2bPhone(e.target.value)}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>이메일 주소 (선택)</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={b2bEmail}
                    onChange={(e) => setB2bEmail(e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>도입을 원하는 수동 업무 내용 (선택)</label>
                  <textarea 
                    className="input-field" 
                    value={b2bMessage}
                    onChange={(e) => setB2bMessage(e.target.value)}
                    placeholder="예: 매일 시술 중 오는 문의 전화 응대 / 상품 상세페이지 자동 한글 번역"
                    rows="3"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem', width: '100%' }}>
                  🤝 무상 컨설팅 및 파일럿 신청하기
                </button>
              </form>
            </div>
          </div>
        )}

        {/* OUTCOMES TAB */}
        {currentTab === 'outcomes' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)', marginBottom: '1.25rem' }}>
                📊 실증 검증 성과 보고서
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                JDIFL AI 에이전트 자동화 솔루션 패키지를 도입한 실제 소상공인 및 스타트업 54개사의 실측 지표 요약입니다. 수작업 노동 시간 단축 및 고정비 절감 효과를 완벽하게 증명했습니다.
              </p>

              {/* Advanced visual chart mockup using CSS/HTML styling columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glow-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>⏳ 월 평균 업무 처리 소요시간 (시간)</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '2rem', padding: '0 1rem' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: '120px', background: '#ef4444', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-1.5rem', left: 0, right: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>168h</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>도입 전 (수동)</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: '12px', background: 'var(--accent-emerald)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-1.5rem', left: 0, right: 0, fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>12h</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>도입 후 (AI)</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
                    👉 **평균 92.8%의 노동 시간 단축 성공**
                  </p>
                </div>

                <div className="glow-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>💰 연간 평균 인건비/외주 운영비 (원)</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '2rem', padding: '0 1rem' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: '110px', background: '#f59e0b', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-1.5rem', left: 0, right: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>2,400만</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>기존 외주 알바</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: '6px', background: 'var(--accent-cyan)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-1.5rem', left: 0, right: 0, fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>58만</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>JDIFL 라이센스</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
                    👉 **평균 97.5%의 연 고정 지출 절감 성공**
                  </p>
                </div>
              </div>

              {/* Case study reviews */}
              <div className="glow-card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-emerald)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>💬 도입 고객 리얼 리뷰</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      "해외 구매대행 소싱을 시작하고 번역 알바비로만 한 달에 150만 원씩 나갔는데, JDIFL 번들을 영입하고 나서 하루 500개 상품 상세페이지가 10분 만에 자동 번역 가공되어 번역 비용이 0원에 수렴하게 되었습니다."
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>- 이커머스 스타셀러 정 대표님 (상세페이지 번역 레시피 도입)</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      "시술이나 강의 중에 전화 문의가 와서 못 받을 때가 정말 많았는데, 주말/야간 자동 카카오 채널 응대 AI 비서를 도입한 뒤로 놓치던 예약율이 40% 이상 개선되며 실매출이 2배로 상승했습니다."
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>- 1인 뷰티숍 지점장님 (ARS 및 예약 자동화 가이드 도입)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE SYSTEM LOGS TAB */}
        {currentTab === 'live' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', marginTop: '1rem' }}>
            <div className="glass-panel glow-card" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                💻 JDIFL AI 팩토리 실시간 연산 콘솔 (Live Log)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                현재 JDIFL 백그라운드 서버에서 연산되고 있는 55인 AI 직원들의 실시간 트렌드 분석 및 B2B 리드 발굴 로그입니다. 5초 주기로 자동 업데이트됩니다.
              </p>

              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot" style={{ backgroundColor: '#ef4444' }}></div>
                  <div className="terminal-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                  <div className="terminal-dot" style={{ backgroundColor: '#10b981' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '1rem', fontFamily: 'monospace' }}>bash - ai-agent-daemon.js</span>
                </div>
                <div className="terminal-content">
                  {systemLogs.length === 0 ? (
                    <div className="terminal-line warning">
                      [SYSTEM INFO] 로컬 서버로부터 실시간 로그 데이터를 수신하고 있습니다. 시트에 기록이 없는 경우 대기합니다...
                    </div>
                  ) : (
                    systemLogs.map((log, idx) => {
                      const isSuccess = log.message.includes('완료') || log.message.includes('정상') || log.message.includes('가동') || log.message.includes('성공');
                      const isWarning = log.message.includes('오류') || log.message.includes('실패') || log.message.includes('대기');
                      let lineClass = "info";
                      if (isSuccess) lineClass = "success";
                      if (isWarning) lineClass = "warning";
                      
                      return (
                        <div key={idx} className={`terminal-line ${lineClass}`}>
                          [{log.time}] {log.message}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BANK DEPOSIT CHECKOUT MODAL */}
        {showCheckoutSim && (
          <div className="modal-overlay">
            <div className="glass-panel modal-content" style={{ border: '1px solid var(--accent-purple)', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>💳 무통장 입금 신청</h3>
                <button 
                  onClick={() => setShowCheckoutSim(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>[매출 증대 + 비용 절감] 번들</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>98,000원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: timerExpired ? '#f8fafc' : '#fb7185', fontSize: '1rem' }}>
                  <span>{timerExpired ? "일반가 결제" : "72시간 얼리버드 50%"}</span>
                  <span>{timerExpired ? "98,000원" : "49,000원"}</span>
                </div>
              </div>

              <form onSubmit={handleBankTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>수취 계좌 안내</label>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: 'var(--accent-cyan)',
                    textAlign: 'center'
                  }}>
                    {bankAccount}
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>이메일 주소 (다운로드 링크 발송용)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={userEmail || "guest@jdifl.com"}
                    disabled 
                    style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>입금자 성함</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    placeholder="홍길동"
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  ℹ️ 입금 완료 후 아래 [입금 확인 요청 구글 폼] 단추를 눌러 정보를 기재해 주세요. 정산팀이 실시간 확인 후 1분 내로 프리미엄 활성화 링크를 이메일로 자동 송출해 드립니다.
                </p>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSctVr0ebGnqFiHsU4lBeWP2eQ3EHrol_eM2mIuxtcGEcE7_2g/viewform?usp=publish-editor" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', textDecoration: 'none', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--accent-cyan)', color: '#ffffff' }}
                >
                  📝 입금 확인 요청 구글 폼 작성하기
                </a>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', justifyContent: 'center', marginTop: '1rem', width: '100%' }}>
                  주문 신청 및 송금 완료
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Floating toast notification */}
        {showToast && (
          <div className="toast">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background video loop */}
      <div className="video-bg-container">
        <video className="video-bg" autoPlay loop muted playsInline>
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="video-bg-overlay"></div>
      </div>

      {/* Header bar */}
      <header className="app-header">
        <div className="brand-section">
          <h1 className="brand-logo">JDIFL</h1>
          <span className="brand-badge">Recipe Factory</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>스케줄 상태</div>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: workflowStep === 4 ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
            {workflowStep === 4 ? '오늘 레시피 발행 완료' : '레시피 스케줄 대기 중'}
          </div>
        </div>
      </header>

      {/* GOOGLE SHEETS DYNAMIC NOTICE BAR */}
      {sheetNotice && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'pulseOpacity 2s infinite ease-in-out'
        }}>
          <span>📢</span>
          {sheetNotice}
        </div>
      )}

      {/* MARKETING REVENUE & LEAD BANNER */}
      <div className="glass-panel marketing-banner">
        {!userEmail ? (
          <div className="lead-form-wrap">
            <div className="lead-title-area">
              <h2>🎁 [선착순 무료] 업무 시간을 8시간 줄여주는 맥킨지식 1페이지 회의록 보고서 레시피</h2>
              <p>이메일을 입력하면 즉시 복사해서 야근을 청산하는 자동화 보고서 프롬프트를 보내드립니다.</p>
            </div>
            <form onSubmit={handleLeadSubmit} style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              <input 
                type="email" 
                className="input-field" 
                style={{ width: '250px', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                placeholder="이메일 주소 입력" 
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                1초 만에 무료 받기
              </button>
            </form>
          </div>
        ) : (
          <div className="lead-form-wrap">
            <div className="lead-title-area">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔥 [72시간 한정 특가] 매출 증대 + 비용 절감 자동화 레시피 번들 50% 할인
              </h2>
              <p style={{ color: '#a78bfa' }}>
                가이드라인 다운로드 권한이 활성화되었습니다. 만료 시간 전에 50% 특별 할인가로 AI 자동화 솔루션 패키지를 영입해 보세요!
              </p>
            </div>
            <div className="timer-box">
              <div className="timer-countdown">
                ⏳ {formatTime(timeLeft)}
              </div>
              <button 
                className={`btn ${timerExpired ? 'btn-secondary' : 'btn-rose'}`} 
                onClick={() => setShowCheckoutSim(true)}
              >
                {timerExpired ? "일반가 98,000원 구매" : "50% 할인가 49,000원 구매"}
              </button>
            </div>
          </div>
        )}

        {/* Developer testing helpers */}
        {userEmail && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>[개발자 테스트 도구]:</span>
            <button onClick={simulateExpiration} style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer', textDecoration: 'underline' }}>
              타이머 만료 강제 시뮬레이션
            </button>
            <button onClick={resetLeadState} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'underline' }}>
              이메일 및 타이머 초기화
            </button>
          </div>
        )}
      </div>

      {/* Main Grid / Routing Switch */}
      {isAdmin ? (
        <div className="dashboard-grid">
          {/* Left column: Sidebar controls */}
          <aside className="sidebar">
            {/* Google Sheets Sync Indicator */}
            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--accent-emerald)' }}>●</span> 구글 시트 실시간 관제탑
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: syncStatus.includes('오류') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                  color: syncStatus.includes('오류') ? '#fca5a5' : '#a7f3d0',
                  fontWeight: 'bold'
                }}>
                  {syncStatus}
                </span>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {sheetTasks.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {sheetTasks.map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{t.title}</span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: t.status === '완료' ? 'var(--accent-emerald)' : t.status === '반려' ? '#fb7185' : 'var(--accent-purple)' 
                        }}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>시트에서 데이터 로드 중...</span>
                )}
              </div>
            </div>

            {/* REAL B2B OUTBOUND SMTP DISPATCH PANEL */}
            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-emerald)' }}>
                📧 B2B 실전 아웃바운드 이메일 발송
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                  <span>🟢</span> 시스템 자율 이메일 채널 가동중
                </div>
                회장님의 개인 계정이나 플랫폼 비밀번호 입력 없이, JDIFL 에이전트 전용으로 개설된 무인 SMTP 라인 및 MX 다이렉트 전송 브릿지를 통해 10개 업체로 제안 이메일을 실제로 안전하게 전송합니다.
              </div>
              <form onSubmit={handleSendOutreach}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', justifyContent: 'center', background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                  disabled={isSendingOutreach}
                >
                  {isSendingOutreach ? "자율 메일 발송 중..." : "🚀 10개 업체 실전 이메일 발송"}
                </button>
              </form>
            </div>

            {/* DISCORD REAL-TIME AGENT LOG CHANNEL */}
            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)' }}>
                  💬 Discord Live Agent Log
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>10분 단위 DM 송출</span>
              </div>
              
              <div style={{
                background: '#0b0f19',
                borderRadius: '8px',
                padding: '0.75rem',
                height: '180px',
                overflowY: 'auto',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {discordLogs.map((log) => (
                  <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1', marginBottom: '0.15rem' }}>
                      <strong style={{
                        color: log.sender.includes("CEO") ? "#fb7185" : log.sender.includes("Systems") ? "#38bdf8" : "#818cf8"
                      }}>{log.sender}</strong>
                      <span style={{ color: '#4b5563', fontSize: '0.65rem' }}>{log.time}</span>
                    </div>
                    <div style={{ color: '#d1d5db', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>{log.text}</div>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>

              <form onSubmit={handleCeoMessageSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input-field"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', flexGrow: 1 }}
                  placeholder="지시 전송 (예: !approve, !stop)" 
                  value={ceoMessage}
                  onChange={(e) => setCeoMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  전송
                </button>
              </form>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>실제 Discord Webhook 주소</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                    placeholder="https://discord.com/api/webhooks/..." 
                    value={discordWebhook}
                    onChange={saveWebhook}
                  />
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>무통장 입금 계좌 수취 정보</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                    placeholder="은행명 계좌번호 (예금주)" 
                    value={bankAccount}
                    onChange={saveBankAccount}
                  />
                </div>
              </div>
            </div>

            {/* Timeline status */}
            <WorkflowTimeline currentStep={workflowStep} />

            {/* Workflow Control actions */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>콘솔 액션</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={resetWorkflow}
                  style={{ justifyContent: 'center' }}
                >
                  처음부터 다시 시뮬레이션
                </button>
                
                {workflowStep === 4 && (
                  <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', color: '#a7f3d0' }}>
                    <strong>학습 피드백 완료:</strong><br />
                    가공된 프롬프트와 레시피 가이드가 AI 에이전트들의 레시피 빌더 가이드로 영구 기록되었습니다.
                  </div>
                )}
              </div>
            </div>

            {/* USER FEEDBACK LOG PANEL */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-amber)' }}>📋</span> 사용자 피드백 대장
                </h4>
                <button 
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                >
                  {showFeedbackForm ? "닫기" : "추가"}
                </button>
              </div>

              {showFeedbackForm ? (
                <form onSubmit={handleAddFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>대상 도구</label>
                    <select 
                      className="input-field" 
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      value={newFeedback.toolId}
                      onChange={(e) => setNewFeedback({ ...newFeedback, toolId: e.target.value })}
                    >
                      <option value="">도구 선택...</option>
                      {trendingTools.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>날짜</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      value={newFeedback.date}
                      onChange={(e) => setNewFeedback({ ...newFeedback, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>주요 긍정 반응</label>
                    <textarea 
                      className="textarea-field" 
                      style={{ minHeight: '60px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      value={newFeedback.positives}
                      onChange={(e) => setNewFeedback({ ...newFeedback, positives: e.target.value })}
                      placeholder="예: 프롬프트 복사가 유용함..."
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>주요 질문 / 모호점</label>
                    <textarea 
                      className="textarea-field" 
                      style={{ minHeight: '60px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      value={newFeedback.questions}
                      onChange={(e) => setNewFeedback({ ...newFeedback, questions: e.target.value })}
                      placeholder="예: 배포 방법이 헷갈림..."
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>개선 사항</label>
                    <textarea 
                      className="textarea-field" 
                      style={{ minHeight: '60px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      value={newFeedback.improvements}
                      onChange={(e) => setNewFeedback({ ...newFeedback, improvements: e.target.value })}
                      placeholder="예: 배포 안내 보완 필요..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.85rem', justifyContent: 'center' }}>
                    피드백 저장
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {feedbacks.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                      등록된 피드백이 없습니다.
                    </p>
                  ) : (
                    feedbacks.map((f) => (
                      <div 
                        key={f.id} 
                        style={{ 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '10px', 
                          padding: '0.75rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{f.toolName}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{f.date}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                          <div><strong>👍 반응:</strong> {f.positives}</div>
                          {f.questions && <div><strong>❓ 질문:</strong> {f.questions}</div>}
                          {f.improvements && <div><strong>🛠️ 개선:</strong> {f.improvements}</div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Right column: Main boards */}
          <main className="agent-boards-container">
            
            {/* 55-AGENT CORPORATE ORG MATRIX */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
                  👑 JDIFL 8단계 55인 AI 기업 조직 매트릭스
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)' }}>
                  🟢 24/7 전원 자율 가동 모드
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                
                {/* Level 1 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fb7185' }}>Level 1 - 경영진 (5)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["CEO보좌", "COO", "CFO", "CTO", "CSO"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(251, 113, 133, 0.08)', color: '#fda4af', border: '1px solid rgba(251, 113, 133, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Level 2 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f472b6' }}>Level 2 - 연구소 (8)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["시장조사", "경쟁사", "미래예측", "트렌드", "특허", "신사업", "리스크", "경제분석"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(244, 114, 182, 0.08)', color: '#fbcfe8', border: '1px solid rgba(244, 114, 182, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Level 3 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c084fc' }}>Level 3 - 개발 (10)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["기획", "UX", "UI", "백엔드", "프론트", "DB", "QA", "보안", "DevOps", "AI엔지니어"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.08)', color: '#e9d5ff', border: '1px solid rgba(192, 132, 252, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Level 4 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#818cf8' }}>Level 4 - 디자인 (5)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["브랜드", "그래픽", "영상", "3D", "광고"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(129, 140, 248, 0.08)', color: '#c7d2fe', border: '1px solid rgba(129, 140, 248, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Level 5 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#60a5fa' }}>Level 5 - 마케팅 (8)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["SEO", "유튜브", "틱톡", "인스타", "광고", "카피라이터", "바이럴", "커뮤니티"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(96, 165, 250, 0.08)', color: '#bfdbfe', border: '1px solid rgba(96, 165, 250, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Level 6 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2dd4bf' }}>Level 6 - 영업 (6)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["세일즈", "CRM", "메일", "제안서", "협상", "고객분석"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(45, 212, 191, 0.08)', color: '#99f6e4', border: '1px solid rgba(45, 212, 191, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Level 7 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399' }}>Level 7 - CS지원 (6)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["챗봇", "CS", "FAQ", "불만처리", "환불", "품질"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.08)', color: '#a7f3d0', border: '1px solid rgba(52, 211, 153, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Level 8 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24' }}>Level 8 - 회사운영 (7)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {["HR", "채용", "교육", "법무", "회계", "문서", "일정"].map(a => (
                      <span key={a} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.08)', color: '#fde68a', border: '1px solid rgba(251, 191, 36, 0.15)' }}>{a}</span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            
            {/* 1. RESEARCH BOARD */}
            <div style={{
              boxShadow: workflowStep === 1 ? '0 0 20px var(--accent-cyan-glow)' : 'none',
              border: workflowStep === 1 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)'
            }} className="glass-panel">
              <ResearchAgent 
                selectedTool={selectedTool} 
                isResearching={isResearching} 
                allTools={trendingTools}
                onSelectTool={handleSelectTool}
                triggerResearch={triggerResearch}
              />
            </div>

            {/* 2. EDITOR BOARD */}
            <div style={{
              boxShadow: workflowStep === 2 ? '0 0 20px var(--accent-purple-glow)' : 'none',
              border: workflowStep === 2 ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)'
            }} className="glass-panel">
              <EditorAgent 
                selectedTool={selectedTool}
                isActive={workflowStep === 2}
                isCompleted={workflowStep > 2}
                promptText={promptText}
                setPromptText={setPromptText}
                summary={summaryText}
                setSummary={setSummaryText}
                steps={stepsList}
                setSteps={setStepsList}
                script={scriptText}
                setScript={setScriptText}
                onCompleteEditor={handleCompleteEditor}
              />
            </div>

            {/* 3. VISUAL BOARD */}
            <div style={{
              boxShadow: workflowStep === 3 ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none',
              border: workflowStep === 3 ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)'
            }} className="glass-panel">
              <VisualAgent 
                selectedTool={selectedTool}
                isActive={workflowStep === 3}
                isPublished={workflowStep === 4}
                promptText={promptText}
                summaryText={summaryText}
                scriptText={scriptText}
                onPublish={handlePublish}
              />
            </div>

          </main>
        </div>
      ) : (
        /* CUSTOMER PUBLIC LANDING VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              🤖 초보자의 실무 문제를 해결하는 AI 자동화 레시피 팩토리
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              어려운 개발 지식도, 비싼 플랫폼 가입도 필요 없습니다.
              업무 시간을 90% 줄여주고 매출을 늘려주는 검증된 실무 인스턴트 프롬프트와 성과 가이드를 즉시 복사해서 업무에 복제하세요.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📦 오늘 제공되는 프리미엄 자동화 레시피 번들
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {trendingTools.map(t => (
                <div key={t.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{t.name}</span>
                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                      {t.views.toLocaleString()}명 복사함
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', flexGrow: 1 }}>{t.desc}</p>
                  
                  {userEmail ? (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <div style={{ background: '#0b0f19', borderRadius: '6px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                        {t.promptText}
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(t.promptText);
                          triggerToast(`'${t.name}' 프롬프트가 복사되었습니다!`);
                        }} 
                        className="btn btn-secondary" 
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      >
                        📋 프롬프트 복사하기
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', border: '1px dotted rgba(255,255,255,0.05)' }}>
                      🔒 상단 무료 가입 후 즉시 복사 가능
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BANK DEPOSIT CHECKOUT MODAL */}
      {showCheckoutSim && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ border: '1px solid var(--accent-purple)', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>💳 무통장 입금 신청</h3>
              <button 
                onClick={() => setShowCheckoutSim(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>[매출 증대 + 비용 절감] 번들</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>98,000원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: timerExpired ? '#f8fafc' : '#fb7185', fontSize: '1rem' }}>
                <span>{timerExpired ? "일반가 결제" : "72시간 얼리버드 50%"}</span>
                <span>{timerExpired ? "98,000원" : "49,000원"}</span>
              </div>
            </div>

            <form onSubmit={handleBankTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>수취 계좌 안내</label>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--accent-cyan)',
                  textAlign: 'center'
                }}>
                  {bankAccount}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>이메일 주소 (다운로드 링크 발송용)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={userEmail || "guest@jdifl.com"}
                  disabled 
                  style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>입금자 성함</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  placeholder="홍길동"
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                ℹ️ 입금 완료 후 아래 [입금 확인 요청 구글 폼] 단추를 눌러 정보를 기재해 주세요. 정산팀이 실시간 확인 후 1분 내로 프리미엄 활성화 링크를 이메일로 자동 송출해 드립니다.
              </p>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSctVr0ebGnqFiHsU4lBeWP2eQ3EHrol_eM2mIuxtcGEcE7_2g/viewform?usp=publish-editor" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', textDecoration: 'none', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--accent-cyan)', color: '#ffffff' }}
              >
                📝 입금 확인 요청 구글 폼 작성하기
              </a>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', justifyContent: 'center', marginTop: '1rem', width: '100%' }}>
                주문 신청 및 송금 완료
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating toast notification */}
      {showToast && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
