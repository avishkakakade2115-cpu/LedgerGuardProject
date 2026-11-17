type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: string;
  accent: "blue" | "green" | "amber" | "red";
};

const StatCard = ({ label, value, detail, icon, accent }: StatCardProps) => {
  return (
    <article className={`stat-card stat-card-${accent}`}>
      <div className="stat-card-top">
        <span className="stat-card-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="stat-card-detail">{detail}</span>
      </div>
      <h2 className="stat-card-label">{label}</h2>
      <p className="stat-card-value">{value}</p>
    </article>
  );
};

export default StatCard;
