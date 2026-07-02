import React from 'react';

export default function ResearchAgent({ 
  selectedTool, 
  isResearching, 
  allTools, 
  onSelectTool, 
  triggerResearch 
}) {
  return (
    <div className="glass-panel agent-card">
      {/* Agent Header */}
      <div className="agent-card-header">
        <div className="agent-title-area">
          <div className="agent-avatar researcher-avatar">🔍</div>
          <div>
            <div className="agent-role">Research Agent</div>
            <div className="agent-description">실무 자동화 니즈 분석 & 솔루션 프롬프트 선정</div>
          </div>
        </div>
        <div className={`agent-status-badge ${isResearching ? 'status-active' : selectedTool ? 'status-complete' : 'status-waiting'}`}>
          {isResearching ? '레시피 분석 중...' : selectedTool ? '수집 완료' : '대기 중'}
        </div>
      </div>

      {/* Action Area */}
      {!selectedTool && !isResearching && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            오늘 초보자들의 실무 시간을 획기적으로 줄여줄 핵심 AI 프롬프트와 레시피 수집을 시작하겠습니다.
          </p>
          <button className="btn btn-cyan" onClick={triggerResearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            실무 자동화 레시피 수집 실행 (09:00 AM)
          </button>
        </div>
      )}

      {/* Loading Scanning State */}
      {isResearching && (
        <div className="scanner-container" style={{ padding: '2rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          <div className="scanner-line"></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '60%' }}></div>
            <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '85%' }}></div>
            <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '90%' }}></div>
            <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '70%' }}></div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>
            비개발자 실무 자동화 커뮤니티 데이터 분석 중...
          </p>
        </div>
      )}

      {/* Completed Selected Tool details */}
      {selectedTool && !isResearching && (
        <div>
          {/* Tool Selector Dropdown to simulate alternate selections */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>수집된 레시피 소스</label>
            <select 
              value={selectedTool.id} 
              onChange={(e) => onSelectTool(allTools.find(t => t.id === e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-display)',
                outline: 'none'
              }}
            >
              {allTools.map(t => (
                <option key={t.id} value={t.id} style={{background: '#181630'}}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              {selectedTool.recipeTitle}
            </h2>
            <p style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: '600' }}>
              🔧 솔루션 도구: {selectedTool.name}
            </p>
          </div>

          <div className="meta-grid">
            <div className="meta-item" style={{ gridColumn: 'span 2' }}>
              <div className="meta-label">해결하려는 실무 문제</div>
              <div className="meta-value" style={{color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '500'}}>{selectedTool.targetProblem}</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>1차 수집 프롬프트 (Raw Recipe)</h4>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#a5f3fc',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              lineHeight: '1.4'
            }}>
              {selectedTool.promptText}
            </pre>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>수집된 기술 스펙 요약</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {selectedTool.description}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>주요 실행 메커니즘</h4>
            <div className="feature-tags-flex">
              {selectedTool.features.map((f, i) => (
                <span key={i} className="feature-tag">{f}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
