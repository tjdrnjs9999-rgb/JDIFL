import React from 'react';

export default function WorkflowTimeline({ currentStep }) {
  const steps = [
    {
      id: 1,
      time: "오전 09:00",
      title: "리서처 (Research Agent)",
      desc: "최신 테크 트렌드 및 Product Hunt 모니터링 후 오늘 최고의 툴 1개 선정.",
      emoji: "🔍"
    },
    {
      id: 2,
      time: "오전 09:30",
      title: "에디터 (Editor Agent)",
      desc: "선정된 툴을 초보자 눈높이의 3문장 요약, 3단계 설명 및 숏폼 대본으로 가공.",
      emoji: "✍️"
    },
    {
      id: 3,
      time: "오전 10:00",
      title: "최종 검수 (COO Review)",
      desc: "결과물 최종 확인, 디자이너 테마 적용 및 수정 피드백 후 즉시 채널 발행.",
      emoji: "👑"
    }
  ];

  return (
    <div className="glass-panel workflow-status-card">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent-purple)'}}>
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        데일리 워크플로우
      </h3>
      <div className="timeline-container">
        {steps.map((s) => {
          let statusClass = "pending";
          if (s.id < currentStep) {
            statusClass = "completed";
          } else if (s.id === currentStep) {
            statusClass = "active";
          }

          return (
            <div key={s.id} className={`timeline-node ${statusClass}`}>
              <div className="timeline-dot">
                <span>{statusClass === "completed" ? "✓" : s.emoji}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-time">{s.time}</div>
                <div className="timeline-title">{s.title}</div>
                <div className="timeline-desc">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
