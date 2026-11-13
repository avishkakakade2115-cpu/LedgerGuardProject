import Sidebar from "../components/Sidebar";

const CompanyDashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <h1>Welcome to LedgerGuard</h1>
        <p>Super Admin Dashboard</p>
      </main>
    </div>
  );
};

export default CompanyDashboard;