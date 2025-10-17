import React from "react";

const SeoContent = ({ data }) => {
  if (!data || !data.content || !data.content[0]?.html) return null;

  return (
    <section className="container mx-auto max-w-6xl mx-auto bg-white">
      <div
        className="prose prose-headings:text-gray-700 prose-p:text-gray-500 prose-a:text-blue-500 prose-img:rounded-lg prose-img:shadow-md max-w-none mx-auto"
        dangerouslySetInnerHTML={{ __html: data.content[0].html }}
      />
    </section>
  );
};

export default SeoContent;
