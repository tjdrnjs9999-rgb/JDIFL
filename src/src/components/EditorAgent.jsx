import React from 'react';

export default function EditorAgent({
  selectedTool,
  isActive,
  isCompleted,
  promptText,
  setPromptText,
  summary,
  setSummary,
  steps,
  setSteps,
  script,
  setScript,
  onCompleteEditor
}) {
  if (!selectedTool) {
    return (
      <div className="glass-panel agent-card" style={{ opacity: 0.5 }}>
        <div className="agent-card-header">
          <div className="agent-title-area">
            <div className="agent-avatar editor-avatar">✍️</div>
            <div>
              <div className="agent-role">Editor Agent</div>
              <div className="agent-description">초보자 실무 레시피 및 프롬프트 최적화</div>
            </div>
          </div>
          <div className="agent-status-badge status-waiting">대기 중</div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
          <p>리서치 에이전트의 레시피 수집이 완료되면 활성화됩니다.</p>
        </div>
      </div>
    );
  }

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  return (
    <div className="glass-panel agent-card">
      {/* Agent Header */}
      <div className="agent-card-header">
        <div className="agent-title-area">
          <div className="agent-avatar editor-avatar">✍️</div>
          <div>
            <div className="agent-role">Editor Agent</div>
            <div className="agent-description">초보자 실무 레시피 및 프롬프트 최적화</div>
          </div>
        </div>
        <div className={`agent-status-badge ${isActive ? 'status-active' : isCompleted ? 'status-complete' : 'status-waiting'}`}>
          {isActive ? '레시피 가공 중' : isCompleted ? '완료' : '대기 중'}
        </div>
      </div>

      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          💡 <strong>초보자 친화 레시피 가이드:</strong> 사용자가 그대로 복사해서 실행할 수 있는 '프롬프트'와 즉시 성과를 내는 '3단계 실무 가이드'로 내용을 최적화해 주세요.
        </p>

        {/* Core Prompt Edit */}
        <div className="form-group">
          <label>복사 가능한 핵심 프롬프트 (Prompt Recipe)</label>
          <textarea 
            className="textarea-field"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={!isActive}
            placeholder="사용자가 복사해서 붙여넣을 프롬프트 템플릿을 완성도 높게 작성합니다."
            style={{ minHeight: '120px', fontFamily: 'monospace', color: '#a5f3fc' }}
          />
        </div>

        {/* 3-Sentence Summary Section */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>초보자 눈높이 3문장 효용 요약</label>
          <textarea 
            className="textarea-field"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={!isActive}
            placeholder="이 레시피가 어떻게 사용자의 실무 시간을 단축해주는지 3문장 이내로 정리합니다."
          />
        </div>

        {/* 3-Step Guide Section */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>실행 과정 3단계 레시피</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {steps.map((s, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="step-num" style={{ marginTop: '0.25rem' }}>{s.step}</div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={s.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    disabled={!isActive}
                    placeholder={`단계 ${s.step} 행동 제목`}
                    style={{ fontWeight: 700, padding: '0.5rem 0.75rem' }}
                  />
                  <input 
                    type="text" 
                    className="input-field" 
                    value={s.desc}
                    onChange={(e) => handleStepChange(index, 'desc', e.target.value)}
                    disabled={!isActive}
                    placeholder={`단계 ${s.step} 구체적 조작법`}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Short-form video script Section */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>레시피 설명용 숏폼 비디오 대본 (50초)</label>
          <textarea 
            className="textarea-field"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            disabled={!isActive}
            placeholder="프롬프트 복사 방법을 알려주는 숏폼 비디오 가이드를 작성합니다."
            style={{ minHeight: '140px' }}
          />
        </div>

        {/* Advance step button */}
        {isActive && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={onCompleteEditor}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              레시피 제작 승인 및 디자이너 전송 (09:30 AM)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
