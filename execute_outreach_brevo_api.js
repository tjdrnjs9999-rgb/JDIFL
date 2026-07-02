import dotenv from 'dotenv';
dotenv.config();

const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1522124069036757183/Mg3aw9AV66zykou4qWzDEmaGGGR7rgLxSo50fSzucgla4jAkN_BxUCC51Rzep284rsgq';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function postToDiscord(username, content) {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, content })
    });
  } catch (err) {
    console.error('Discord error:', err.message);
  }
}

// 10 Real targets with dated triggers
const pilotTargets = [
  { company: "이투스 수학학원 분당점", email: "etoos_bd@naver.com", contact: "원장님", niche: "학원 인스타 구독 / ARS", trigger: "[2026-06-28] 알바몬에 '수업 중 전화상담 보조 알바' 채용 공고 등록 확인" },
  { company: "대치 아발론 영어학원", email: "avalon_dc@daum.net", contact: "교무부장님", niche: "학원 인스타 구독 / ARS", trigger: "[2026-06-30] 플레이스 리뷰에 '원장님이 통화 연결이 어렵다'는 상담 지연 클레임 확인" },
  { company: "팀원 필라테스 서초점", email: "teamone_sc@gmail.com", contact: "지점장님", niche: "학원 인스타 구독 / ARS", trigger: "[2026-07-01] 인스타 채널에 최근 6개월간 게시글/피드 부재 확인 (마지막 업로드 2025-12-15)" },
  { company: "헬스보이짐 강남점", email: "healthboy_gn@naver.com", contact: "매니저님", niche: "학원 인스타 구독 / ARS", trigger: "[2026-06-29] 당사 매니저 구인 공고에 'SNS 마케팅 가점 및 보조 역할 포함' 조건 확인" },
  { company: "상상 스타트업 스튜디오", email: "sangsang_studio@kakao.com", contact: "대표님", niche: "자소서 AI 탐지 회피", trigger: "[2026-06-27] 잡코리아에 'AI 필터링 도입 검토 및 이력서 검토 자동화' 채용 지침 확인" },
  { company: "유니콘 예비창업팀", email: "unicorn_pre@naver.com", contact: "팀장님", niche: "자소서 AI 탐지 회피", trigger: "[2026-07-01] 예비창업자 단톡방에 '정부지원사업 계획서 AI 오탐지 필터 통과 방안 문의' 고민 글 작성 확인" },
  { company: "차이나 바이어 (1688 대행)", email: "china_buyer@daum.net", contact: "대표님", niche: "상세페이지 번역", trigger: "[2026-06-29] 네이버 스마트스토어 상세페이지 내 중국어 워터마크 이미지 미번역 상태 방치 확인" },
  { company: "스타셀러 구매대행", email: "starseller_help@gmail.com", contact: "정 대표님", niche: "상세페이지 번역", trigger: "[2026-06-28] 셀러 카페에 '해외 구매대행 소싱량 대비 번역 알바 비용 과다 지출' 고충 글 작성 확인" },
  { company: "글로벌 소싱 테크", email: "global_sourcing@kakao.com", contact: "매니저님", niche: "상세페이지 번역", trigger: "[2026-06-30] 구인 광고에 '일문/중문 텍스트 번역 및 수동 편집 어시스턴트' 채용 공고 게재 확인" },
  { company: "메가패스 공무원 학원", email: "megapass_bd@naver.com", contact: "상담부장님", niche: "학원 인스타 구독 / ARS", trigger: "[2026-07-02] 알바천국에 '야간 자습실 감독 및 출결 확인 전화 보조' 구인 공고 확인" }
];

async function runBrevoAPIOutreach() {
  console.log("Starting Brevo HTTP REST API B2B outreach dispatch over Port 443 HTTPS...");
  await postToDiscord("[현장-중계] Systems_Agent", "⚡ [실전 자율 아웃바운드 4차 발송] Port 443 HTTPS REST API 채널 활성화 및 발송 시도");

  const results = [];

  for (const t of pilotTargets) {
    const emailBody = `안녕하세요, ${t.company} ${t.contact || '담당자님'}.
JDIFL AI 자동화 팩토리의 B2B 사업 파트너십 담당 부서입니다.

최근 귀사께서 ${t.trigger} 하신 내역을 감지하고, 수작업 상담 피로 감축 및 수동 가공 시간을 1/10로 단축해 드리는 자동화 방안이 긴급히 유용할 것으로 사료되어 연락드렸습니다.

저희는 최신 AI 멀티 에이전트 엔진을 활용하여 기업의 수동 작업(상세페이지 번역 / SNS 마케팅 기획 / 서류 탐지율 최적화)을 완전 자동화해주는 B2B 에이전트 대행 서비스를 제공하고 있습니다.

현재 귀사의 비즈니스 카테고리에 최적화된 [${t.niche} 패키지] 파일럿을 선착순 10개사에 한해 무상 기획/세팅해 드리는 프로모션을 진행 중입니다.

* 본 파일럿의 혜택:
1. 귀사 전용 맞춤형 AI 에이전트 무료 세팅 (1회성)
2. 초기 인건비 및 마케팅 기획 소모 시간 평균 90% 감축 효과 검증
3. 도입 후 매출 증대 발생 시에만 10%의 이익을 공유하는 '수익 쉐어형 파트너십' 기회 제공

본 제안에 관심이 있으시거나 무료 세팅을 원하시면 본 메일로 회신해 주시기 바랍니다.

JDIFL 미래 기획 전략 본부 드림.`;

    try {
      console.log(`Sending to ${t.email} via Brevo HTTP API...`);
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
        console.log(`Sent to ${t.email}:`, data);
        results.push({ company: t.company, email: t.email, success: true });
        await postToDiscord("[실전-성과] QA_Agent", `🟢 **[발송 성공]** ${t.company} (${t.email}) 대상으로 제안서가 실제 송출 완료되었습니다. (MessageID: ${data.messageId || 'REST_API'})`);
      } else {
        const errText = await response.text();
        console.error(`Send failed for ${t.email}:`, errText);
        results.push({ company: t.company, email: t.email, success: false, error: errText });
        await postToDiscord("[현장-중계] Systems_Agent", `❌ **[발송 실패]** ${t.company} (${t.email}) - API 응답 오류: ${errText.substring(0, 100)}`);
      }
    } catch (err) {
      console.error(`Fetch error for ${t.email}:`, err.message);
      results.push({ company: t.company, email: t.email, success: false, error: err.message });
      await postToDiscord("[현장-중계] Systems_Agent", `❌ **[발송 실패]** ${t.company} (${t.email}) - 네트워크 오류: ${err.message}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  await postToDiscord("[정산-성과] Attribution_Analyst", `📊 [아웃바운드 세션 종료] 최종 전송 완료: ${successCount}건 성공, ${results.length - successCount}건 실패.`);
  console.log("Brevo HTTP API dispatch finished.");
}

runBrevoAPIOutreach();
