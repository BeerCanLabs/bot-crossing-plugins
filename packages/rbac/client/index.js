/**
 * Bot Crossing RBAC Client Adapter
 */
const normAgent = (a) => (a || '').toLowerCase().replace(/^sm-/, '').replace(/^submind:/, '').trim()

;(async function initColonyRbac() {
  try {
    const res = await fetch('/api/rbac/me')
    if (!res.ok) return
    const me = await res.json()

    window.colonyRbac = {
      ...me,
      canChatWith(agentName) {
        if (me.isAdmin || me.role === 'admin') return true
        if (me.role === 'agent_manager') {
          const list = me.allowedAgents || []
          if (list.includes('*')) return true
          const target = normAgent(agentName)
          return list.some((allowed) => normAgent(allowed) === target)
        }
        return false // Spectator or unauthorized
      }
    }

    // Mount user identity pill to top-center HUD (with dismiss / hide button)
    const mountBadge = () => {
      if (document.getElementById('colony-rbac-badge')) return
      if (sessionStorage.getItem('colony-rbac-dismissed') === '1') return

      const badge = document.createElement('div')
      badge.id = 'colony-rbac-badge'
      badge.style.cssText = `
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(14, 18, 25, 0.9);
        border: 1px solid ${me.role === 'admin' ? '#00e5ff' : me.role === 'agent_manager' ? '#ffd166' : me.role === 'spectator' ? '#8892b0' : '#ef4444'};
        color: #e2e8f0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 600;
        padding: 5px 10px 5px 12px;
        border-radius: 9999px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 10px rgba(0,229,255,0.15);
        letter-spacing: 0.5px;
        transition: opacity 0.2s ease, transform 0.2s ease;
      `

      const roleColors = {
        admin: '#00e5ff',
        agent_manager: '#ffd166',
        spectator: '#a0aec0',
        unauthorized: '#ef4444'
      }

      badge.innerHTML = `
        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${roleColors[me.role] || '#fff'};"></span>
        <span>${me.user?.email || 'Guest'}</span>
        <span style="opacity:0.6; text-transform:uppercase; font-size:10px; margin-left:2px;">[${me.role}]</span>
        <button id="colony-rbac-dismiss" title="Hide identity pill" style="
          background: transparent;
          border: none;
          color: #8892b0;
          font-size: 11px;
          line-height: 1;
          margin-left: 6px;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, background 0.15s ease;
        ">✕</button>
      `

      const dismissBtn = badge.querySelector('#colony-rbac-dismiss')
      if (dismissBtn) {
        dismissBtn.addEventListener('mouseenter', () => {
          dismissBtn.style.color = '#fff'
          dismissBtn.style.background = 'rgba(255,255,255,0.15)'
        })
        dismissBtn.addEventListener('mouseleave', () => {
          dismissBtn.style.color = '#8892b0'
          dismissBtn.style.background = 'transparent'
        })
        dismissBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          badge.style.opacity = '0'
          badge.style.transform = 'translateX(-50%) translateY(-8px)'
          sessionStorage.setItem('colony-rbac-dismissed', '1')
          setTimeout(() => badge.remove(), 220)
        })
      }

      document.body.appendChild(badge)
    }

    if (document.body) mountBadge()
    else window.addEventListener('DOMContentLoaded', mountBadge)

  } catch (err) {
    console.warn('[RBAC] Client auth init error:', err)
  }
})()
