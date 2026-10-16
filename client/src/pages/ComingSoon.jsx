export default function ComingSoon({ title, description }) {
  return (
    <div className="page">
      <h1 className="page-title">{title}</h1>
      <div className="coming-soon">
        <span className="coming-soon-icon">🚀</span>
        <h2>Próximamente</h2>
        <p>{description}</p>
        <span className="coming-soon-badge">En desarrollo</span>
      </div>
    </div>
  );
}
