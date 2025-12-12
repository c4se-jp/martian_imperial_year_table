import { useEffect, useMemo } from "react";
import { marked } from "marked";
import descriptionMd from "../description.md?raw";

export default function DescriptionPage() {
  useEffect(() => {
    document.title = "解説 | 帝國火星曆";
  }, []);

  const html = useMemo(() => marked.parse(descriptionMd), []);

  return (
    <section className="section">
      <div className="container content" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
