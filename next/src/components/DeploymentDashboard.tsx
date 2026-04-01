import React, { useState, useEffect, useMemo } from 'react';

interface DeploymentStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
  lastCheck?: string;
  message?: string;
  responseTime?: number;
}

interface CheckItem {
  id: string;
  category: string;
  name: string;
  checked: boolean;
  critical: boolean;
}

const Dashboard: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus[]>([]);
  const [checklist, setChecklist] = useState<CheckItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deployment-checklist');
      if (saved) return JSON.parse(saved);
    }
    return [
      // Environment & Build
      { id: 'env-vars', category: 'Environment', name: 'Environment variables defined', checked: false, critical: true },
      { id: 'build-success', category: 'Environment', name: 'Build succeeds locally', checked: false, critical: true },
      { id: 'no-warnings', category: 'Environment', name: 'No build warnings', checked: false, critical: true },

      // Code Quality
      { id: 'lint', category: 'Code Quality', name: 'Linting passes', checked: false, critical: false },
      { id: 'format', category: 'Code Quality', name: 'Code formatted', checked: false, critical: false },
      { id: 'types', category: 'Code Quality', name: 'No TypeScript errors', checked: false, critical: false },

      // Performance
      { id: 'bundle-size', category: 'Performance', name: 'Bundle size optimal', checked: false, critical: false },
      { id: 'web-vitals', category: 'Performance', name: 'Core Web Vitals met', checked: false, critical: false },
      { id: 'images-opt', category: 'Performance', name: 'Images optimized', checked: false, critical: false },

      // Security
      { id: 'no-secrets', category: 'Security', name: 'No hardcoded secrets', checked: false, critical: true },
      { id: 'headers', category: 'Security', name: 'Security headers set', checked: false, critical: true },
      { id: 'https', category: 'Security', name: 'HTTPS enabled', checked: false, critical: true },

      // Strapi
      { id: 'strapi-build', category: 'Strapi', name: 'Strapi builds successfully', checked: false, critical: true },
      { id: 'strapi-db', category: 'Strapi', name: 'Database migrations done', checked: false, critical: true },
      { id: 'strapi-api', category: 'Strapi', name: 'API permissions configured', checked: false, critical: true },

      // Vercel
      { id: 'vercel-config', category: 'Vercel', name: 'vercel.json configured', checked: false, critical: true },
      { id: 'vercel-env', category: 'Vercel', name: 'Environment vars in Vercel', checked: false, critical: true },
      { id: 'vercel-domains', category: 'Vercel', name: 'Domains configured', checked: false, critical: true },

      // Post-Deploy
      { id: 'post-test', category: 'Post-Deploy', name: 'Features tested on preview', checked: false, critical: false },
      { id: 'perf-bench', category: 'Post-Deploy', name: 'Performance benchmarked', checked: false, critical: false },
      { id: 'monitoring', category: 'Post-Deploy', name: 'Monitoring enabled', checked: false, critical: false },
    ];
  });

  const checkDeploymentStatus = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:1337';
      const webUrl = process.env.REACT_APP_WEBSITE_URL || 'http://localhost:3000';

      const statuses: DeploymentStatus[] = [
        { service: 'Strapi API', status: 'unknown' },
        { service: 'Next.js App', status: 'unknown' },
        { service: 'Strapi Admin', status: 'unknown' },
      ];

      // Check each service
      for (const status of statuses) {
        try {
          let url = '';
          if (status.service === 'Strapi API') url = `${apiUrl}/health`;
          else if (status.service === 'Next.js App') url = `${webUrl}/api/health`;
          else if (status.service === 'Strapi Admin') url = `${apiUrl}/admin`;

          const start = Date.now();
          const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
          const responseTime = Date.now() - start;

          if (response.ok) {
            status.status = 'healthy';
            status.message = 'Operational';
            status.responseTime = responseTime;
          } else {
            status.status = 'unhealthy';
            status.message = `HTTP ${response.status}`;
            status.responseTime = responseTime;
          }
        } catch (err) {
          status.status = 'unhealthy';
          status.message = err instanceof Error ? err.message : 'Connection failed';
        }
      }

      setDeploymentStatus(statuses);
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  };

  const toggleCheckItem = (id: string) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    localStorage.setItem('deployment-checklist', JSON.stringify(updated));
  };

  const resetChecklist = () => {
    setChecklist(checklist.map(item => ({ ...item, checked: false })));
    localStorage.removeItem('deployment-checklist');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'unhealthy': return '🔴';
      case 'warning': return '🟡';
      default: return '⚪';
    }
  };

  const categories = Array.from(new Set(checklist.map(item => item.category)));
  
  const getCategoryProgress = (category: string) => {
    const items = checklist.filter(item => item.category === category);
    const checked = items.filter(item => item.checked);
    return { checked: checked.length, total: items.length };
  };

  useEffect(() => {
    // Check deployment status on mount
    checkDeploymentStatus();
  }, []);

  // Compute prodReady from current checklist
  const criticalItems = checklist.filter(item => item.critical);
  const criticalChecked = criticalItems.filter(item => item.checked);
  const prodReady = criticalItems.length > 0 && criticalItems.length === criticalChecked.length;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <style>{`
        * { box-sizing: border-box; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; color: #1e293b; }
        .header p { margin: 0; color: #64748b; font-size: 14px; }
        .status-box { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 15px; 
          margin-bottom: 30px;
        }
        .status-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          background: #f8fafc;
        }
        .status-card.healthy { border-left: 4px solid #10b981; }
        .status-card.unhealthy { border-left: 4px solid #ef4444; }
        .status-card.warning { border-left: 4px solid #f59e0b; }
        .status-card h3 { margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b; }
        .status-card.healthy h3 { color: #10b981; }
        .status-card.unhealthy h3 { color: #ef4444; }
        .status-card p { margin: 0; font-size: 12px; color: #64748b; }
        
        .readiness {
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
        }
        .readiness.ready {
          background: #d1fae5;
          border: 1px solid #10b981;
        }
        .readiness.not-ready {
          background: #fee2e2;
          border: 1px solid #ef4444;
        }
        .readiness h2 { margin: 0 0 5px 0; font-size: 18px; }
        .readiness.ready h2 { color: #10b981; }
        .readiness.not-ready h2 { color: #ef4444; }
        .readiness p { margin: 0; font-size: 14px; color: #374151; }
        
        .checklist-section { margin-bottom: 30px; }
        .checklist-section h3 { 
          margin: 0 0 10px 0; 
          font-size: 16px; 
          font-weight: 600;
          color: #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .category-progress { 
          font-size: 12px; 
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .checkbox-group { display: flex; flex-direction: column; gap: 8px; }
        .checkbox-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        .checkbox-item:hover { background: #f8fafc; }
        .checkbox-item input { margin-right: 10px; cursor: pointer; accent-color: #3b82f6; }
        .checkbox-item label { 
          flex: 1; 
          cursor: pointer; 
          margin: 0;
          font-size: 14px;
          color: #1e293b;
        }
        .checkbox-item input:checked ~ label { color: #10b981; font-weight: 500; }
        .checkbox-item.critical { border-left: 3px solid #ef4444; }
        
        .actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 30px;
        }
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary {
          background: #e2e8f0;
          color: #1e293b;
        }
        .btn-secondary:hover { background: #cbd5e1; }
        .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
      `}
      </style>

      <div className="header">
        <h1>🚀 Deployment Dashboard</h1>
        <p>Strapi + Next.js Production Readiness Checklist</p>
      </div>

      {/* Service Status */}
      <div className="status-box">
        {deploymentStatus.map(status => (
          <div key={status.service} className={`status-card ${status.status}`}>
            <h3>{getStatusIcon(status.status)} {status.service}</h3>
            <p>{status.message}</p>
            {status.responseTime && <p>Response: {status.responseTime}ms</p>}
          </div>
        ))}
      </div>

      {/* Production Readiness */}
      <div className={`readiness ${prodReady ? 'ready' : 'not-ready'}`}>
        <h2>{prodReady ? '✓ Ready for Production' : '⚠ Not Ready'}</h2>
        <p>
          {prodReady
            ? 'All critical checks passed. You can proceed with deployment.'
            : `Complete ${checklist.filter(i => i.critical && !i.checked).length} critical items to deploy`}
        </p>
      </div>

      {/* Checklist by Category */}
      {categories.map(category => {
        const progress = getCategoryProgress(category);
        return (
          <div key={category} className="checklist-section">
            <h3>
              {category}
              <span className="category-progress">
                {progress.checked}/{progress.total}
              </span>
            </h3>
            <div className="checkbox-group">
              {checklist
                .filter(item => item.category === category)
                .map(item => (
                  <label
                    key={item.id}
                    className={`checkbox-item ${item.critical ? 'critical' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheckItem(item.id)}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
            </div>
          </div>
        );
      })}

      {/* Actions */}
      <div className="actions">
        <button
          className="btn-primary"
          onClick={checkDeploymentStatus}
        >
          🔄 Refresh Status
        </button>
        <button
          className="btn-secondary"
          onClick={resetChecklist}
        >
          ↻ Reset Checklist
        </button>
      </div>
    </div>
  );
};

export default Dashboard;