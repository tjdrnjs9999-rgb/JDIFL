import React, { useState, useEffect } from 'react';

export default function VisualAgent({
  selectedTool,
  isActive,
  isPublished,
  promptText,
  summaryText,
  scriptText,
  onPublish
}) {
  const [selectedTheme, setSelectedTheme] = useState('cyberpunk');
  const [activeTab, setActiveTab] = useState('card'); // 'card' or 'video'
  
  // Video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCaption, setCurrentCaption] = useState("");

  const themes = {
    cyberpunk: {
      name: "Neon Cyberpunk",
      gradient: "linear-gradient(135deg, #090816 0%, #120e29 50%, #201740 100%)",
      glowColor: "rgba(6, 182, 212, 0.4)",
      accentColor: "#06b6d4",
      accentText: "#22d3ee",
      badgeBg: "rgba(6, 182, 212, 0.15)",
      badgeBorder: "rgba(6, 182, 212, 0.4)"
    },
    emerald: {
      name: "Emerald Garden",
      gradient: "linear-gradient(135deg, #021a11 0%, #062f22 50%, #0a3d2e 100%)",
      glowColor: "rgba(16, 185, 129, 0.4)",
      accentColor: "#10b981",
      accentText: "#34d399",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.4)"
    },
    stealth: {
      name: "Stealth Chrome",
      gradient: "linear-gradient(135deg, #000000 0%, #111111 50%, #222222 100%)",
      glowColor: "rgba(255, 255, 255, 0.2)",
      accentColor: "#ffffff",
      accentText: "#ffffff",
      badgeBg: "rgba(255, 255, 255, 0.08)",
      badgeBorder: "rgba(255, 255, 255, 0.25)"
    },
    midnight: {
      name: "Royal Midnight",
      gradient: "linear-gradient(135deg, #030712 0%, #0b1329 50%, #1e1b4b 100%)",
      glowColor: "rgba(139, 92, 246, 0.4)",
      accentColor: "#8b5cf6",
      accentText: "#a78bfa",
      badgeBg: "rgba(139, 92, 246, 0.15)",
      badgeBorder: "rgba(139, 92, 246, 0.4)"
    }
  };

  const currentTheme = themes[selectedTheme];

  // Video progress interval
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1; // 1% every 100ms = 10s total playback simulation
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Caption mapping logic based on scriptText and playback progress
  useEffect(() => {
    if (!scriptText) {
      setCurrentCaption("대본 정보를 로딩 중입니다...");
      return;
    }
    
    // Split script into sentences or major paragraphs
    const paragraphs = scriptText.split('\n\n');
    let opening = paragraphs[0] || "[오프닝] 영상 준비 완료.";
    let body = paragraphs[1] || "[본론] AI 툴 연동 및 실행.";
    let closing = paragraphs[2] || "[클로징] 10분 완성 레시피 확인.";

    if (progress === 0) {
      setCurrentCaption("▶ 재생 버튼을 눌러 비디오를 시뮬레이션하세요");
    } else if (progress < 25) {
      setCurrentCaption(opening);
    } else if (progress < 75) {
      setCurrentCaption(body);
    } else {
      setCurrentCaption(closing);
    }
  }, [progress, scriptText]);

  if (!selectedTool) {
    return (
      <div className="glass-panel agent-card" style={{ opacity: 0.5 }}>
        <div className="agent-card-header">
          <div className="agent-title-area">
            <div className="agent-avatar visual-avatar">🎨</div>
            <div>
              <div className="agent-role">Visual Agent</div>
              <div className="agent-description">레시피 카드 레이아웃 및 템플릿 디자인 가이드</div>
            </div>
          </div>
          <div className="agent-status-badge status-waiting">대기 중</div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
          <p>에디터 에이전트의 레시피 가공이 완료되면 활성화됩니다.</p>
        </div>
      </div>
    );
  }

  const truncatedPrompt = promptText && promptText.length > 120 
    ? promptText.substring(0, 120) + "..." 
    : promptText;

  return (
    <div className="glass-panel agent-card">
      {/* Agent Header */}
      <div className="agent-card-header">
        <div className="agent-title-area">
          <div className="agent-avatar visual-avatar">🎨</div>
          <div>
            <div className="agent-role">Visual Agent</div>
            <div className="agent-description">레시피 카드 레이아웃 및 템플릿 디자인 가이드</div>
          </div>
        </div>
        <div className={`agent-status-badge ${isActive ? 'status-active' : isPublished ? 'status-complete' : 'status-waiting'}`}>
          {isActive ? '디자인 가동 중' : isPublished ? '발행 완료' : '대기 중'}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {/* Preview Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              className={`theme-btn ${activeTab === 'card' ? 'active' : ''}`}
              style={{ width: '130px', padding: '0.4rem 0' }}
              onClick={() => setActiveTab('card')}
            >
              🖼️ 카드뉴스 미리보기
            </button>
            <button 
              className={`theme-btn ${activeTab === 'video' ? 'active' : ''}`}
              style={{ width: '130px', padding: '0.4rem 0' }}
              onClick={() => setActiveTab('video')}
            >
              📱 숏폼 영상 시뮬레이터
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Object.keys(themes).map((tKey) => (
              <button 
                key={tKey}
                onClick={() => setSelectedTheme(tKey)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedTheme === tKey ? '2px solid white' : '1px solid transparent',
                  background: themes[tKey].accentColor,
                  cursor: 'pointer',
                  padding: 0
                }}
                title={themes[tKey].name}
              />
            ))}
          </div>
        </div>

        {activeTab === 'card' ? (
          /* CARD PREVIEW VIEW */
          <div 
            className="card-layout-preview"
            style={{
              background: currentTheme.gradient,
              '--glow-color': currentTheme.glowColor
            }}
          >
            <div className="card-backdrop-glow"></div>
            
            <div className="card-content-wrap">
              <div>
                <div 
                  className="card-header-badge"
                  style={{
                    background: currentTheme.badgeBg,
                    border: `1px solid ${currentTheme.badgeBorder}`,
                    color: currentTheme.accentText
                  }}
                >
                  🍳 RECIPE: {selectedTool.name}
                </div>

                <h2 className="card-title" style={{ color: '#ffffff', fontSize: '1.4rem', lineHeight: '1.2', marginBottom: '0.5rem' }}>
                  {selectedTool.recipeTitle}
                </h2>
                
                <div style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '1rem',
                  borderLeft: `3px solid ${currentTheme.accentColor}`,
                  lineHeight: '1.3'
                }}>
                  <span style={{ color: currentTheme.accentText, fontWeight: 'bold', display: 'block', fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                    COPYABLE PROMPT:
                  </span>
                  {truncatedPrompt}
                </div>

                <p className="card-body-summary" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: 0 }}>
                  {summaryText || "내용을 작성해주세요."}
                </p>
              </div>

              <div className="card-footer" style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
                <div className="card-logo" style={{ color: '#ffffff' }}>
                  JDIFL <span>Recipe Factory</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                  AUTOMATION RECIPE
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* VERTICAL VIDEO SIMULATOR VIEW (Shorts player mockup) */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0' }}>
            <div 
              style={{ 
                width: '280px', 
                height: '460px', 
                background: currentTheme.gradient,
                borderRadius: '24px', 
                border: '6px solid #1e1b4b',
                boxShadow: '0 15px 35px rgba(0,0,0,0.7)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Camera Notch mockup */}
              <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '15px', background: '#1e1b4b', borderRadius: '10px', zIndex: 10 }} />
              
              {/* Simulated Sound Wave lines inside overlay */}
              {isPlaying && (
                <div style={{ position: 'absolute', top: '35px', left: '20px', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '20px', zIndex: 5 }}>
                  {[10, 18, 12, 16, 8, 14].map((h, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        width: '3px', 
                        height: `${h}px`, 
                        background: currentTheme.accentColor, 
                        borderRadius: '2px',
                        animation: 'pulseOpacity 0.8s infinite alternate' 
                      }} 
                    />
                  ))}
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginLeft: '4px', fontWeight: 'bold' }}>AI 보이스 재생 중</span>
                </div>
              )}

              {/* Vertical Screen Content */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '2rem 1.5rem 1.5rem 1.5rem', zIndex: 2, position: 'relative' }}>
                
                {/* Simulated Top overlay info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>
                  <span>JDIFL Shorts</span>
                  <span>🔥 인기 급상승</span>
                </div>

                {/* Simulated Play/Pause overlay */}
                <div style={{ alignSelf: 'center', margin: 'auto 0' }}>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)',
                      border: `2px solid ${currentTheme.accentColor}`,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: `0 0 15px ${currentTheme.glowColor}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="4" x2="18" y2="20"></line>
                        <line x1="6" y1="4" x2="6" y2="20"></line>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Subtitle / Caption block (highlights matching content) */}
                <div style={{ width: '100%', background: 'rgba(0,0,0,0.7)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#fef08a', // Vivid yellow for captions
                    fontWeight: '700',
                    lineHeight: '1.4',
                    textAlign: 'center',
                    width: '100%',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {currentCaption}
                  </p>
                </div>

                {/* Progress bar inside phone */}
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: currentTheme.accentColor, transition: 'width 0.1s linear' }} />
                </div>
              </div>

              {/* TikTok / Shorts UI Icons right side overlay */}
              <div style={{ position: 'absolute', right: '10px', bottom: '110px', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 5, color: '#fff', fontSize: '0.6rem', textAlign: 'center' }}>
                <div>
                  <div style={{ background: 'rgba(0,0,0,0.5)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}>❤️</div>
                  <span style={{ fontWeight: 'bold' }}>2.4K</span>
                </div>
                <div>
                  <div style={{ background: 'rgba(0,0,0,0.5)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}>💬</div>
                  <span style={{ fontWeight: 'bold' }}>328</span>
                </div>
                <div>
                  <div style={{ background: 'rgba(0,0,0,0.5)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}>🔗</div>
                  <span style={{ fontWeight: 'bold' }}>공유</span>
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              * 10초로 단축 구현된 AI 숏폼 영상 및 오토 캡션 싱크 시뮬레이터입니다.
            </p>
          </div>
        )}

        {/* Styling Guidelines summary */}
        <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: currentTheme.accentText }}>■</span> 레시피 디자인 스펙
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div><strong>배경 그라데이션:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{currentTheme.gradient.substring(0, 30)}...</span></div>
            <div><strong>글로우 컬러:</strong> <span style={{ fontFamily: 'monospace' }}>{currentTheme.glowColor}</span></div>
            <div><strong>포인트 컬러:</strong> <span style={{ fontFamily: 'monospace', color: currentTheme.accentColor }}>{currentTheme.accentColor}</span></div>
            <div><strong>콘텐츠 구조:</strong> {activeTab === 'card' ? 'Badge ➔ Title ➔ Codebox ➔ Summary' : 'Shorts Notch ➔ Soundwave ➔ Play button ➔ Audio Caption ➔ Progress bar'}</div>
          </div>
        </div>

        {/* Final CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify({
                recipe: selectedTool.recipeTitle,
                tool: selectedTool.name,
                prompt: promptText,
                theme: currentTheme.name,
                body: summaryText,
                script: scriptText
              }, null, 2));
              alert("레시피 JSON 토큰 정보가 클립보드에 복사되었습니다!");
            }}
          >
            레시피 데이터 복사
          </button>
          
          {isActive && (
            <button className="btn btn-success" onClick={onPublish}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              레시피 최종 발행 승인 (10:00 AM)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
