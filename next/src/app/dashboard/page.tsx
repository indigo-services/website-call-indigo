import DeploymentDashboard from '@/src/components/DeploymentDashboard';

export const metadata = {
  title: 'Deployment Dashboard | Indigo Studio',
  description:
    'Production deployment readiness checklist and status monitoring',
};

export default function DashboardPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <DeploymentDashboard />
    </main>
  );
}
