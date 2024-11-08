import React from "react";

const PageHeaders = ({ title, description }) => {
  return (
      <div className="rounded my-16 mx-auto">
          <h1 className="text-4xl text-left text-accent font-bold mb-2">{title}</h1>
          {description && <p className="text-subtext1 text-left">{description}</p>}
    </div>
  );
};

export default PageHeaders;