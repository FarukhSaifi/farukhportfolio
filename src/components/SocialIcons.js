import React from "react";

const SocialIcons = (props) => {
  const { url, icon } = props;
  return (
    <li className="a-header in-view">
      <a href={url} className="c-social-button t-social-button">
        <i className={`fab fa-lg in-view ${icon}`}></i>
      </a>
    </li>
  );
};

export default React.memo(SocialIcons);
