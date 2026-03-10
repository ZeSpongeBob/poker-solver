interface GaugeValues {
  bet: number;
  check: number;
  raise: number;
  fold: number;
}

export function ActionGauge({ values, title }: { values: GaugeValues; title: string }) {
  const rows: Array<keyof GaugeValues> = ['bet', 'check', 'raise', 'fold'];
  return (
    <div className="gauge-box">
      <h3>{title}</h3>
      {rows.map((key) => (
        <div className="gauge-row" key={key}>
          <span>{key.toUpperCase()}</span>
          <div className="gauge-track"><div className={`gauge-fill ${key}`} style={{ width: `${values[key]}%` }} /></div>
          <strong>{values[key]}%</strong>
        </div>
      ))}
    </div>
  );
}
