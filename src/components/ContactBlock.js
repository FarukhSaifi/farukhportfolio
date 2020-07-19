import React from "react";

const ContactBlock = (props) => {
  const { title, value, text } = props;
  return (
    <div className="o-grid__col-md-3 o-grid__col-sm-6 ">
      <div className="a-header o-content in-view">
        <div className="o-content__body">
          <a href={value} className="t-link-container">
            <h4>{title}</h4>
            <p className="t-link-container__item--blended">{text}</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContactBlock);
