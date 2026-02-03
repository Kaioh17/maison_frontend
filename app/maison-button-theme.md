 <button 
                  className={`bw-btn bw-btn-action ${isAssignDriverHovered ? 'custom-hover-border' : ''}`}
                  onClick={() => setShowAssignDriver(true)}
                  onMouseEnter={() => setIsAssignDriverHovered(true)}
                  onMouseLeave={() => setIsAssignDriverHovered(false)}
                  style={{
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isAssignDriverHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                      borderColor: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      color: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <Plus className="w-4 h-4" style={{ 
                    width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                    height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                    color: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit',
                    fill: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor' 
                  }} />
                  <span style={{ color: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    Assign Driver
                  </span>
                </button>


MAISON THEME: rgba(155, 97, 209, 0.81) 
