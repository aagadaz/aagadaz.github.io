interface Props {
  index: string;   // "01", "02"… repère visuel de lecture
  title: string;
  id: string;      // id du <h2>, relié à la <section> via aria-labelledby
}

export function SectionHeading({ index, title, id }: Props) {
  return (
    <h2 id={id} className="section-title">
      <span className="section-index">{index}</span>
      {title}
    </h2>
  );
}
