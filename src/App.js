import React, { useEffect, useState } from "react";
import ContactBlock from "./components/ContactBlock";
import Loader from "./components/Loader";
import SocialIcons from "./components/SocialIcons";
import data from "./data.json";

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  const { name, avatar, jobTitle, socials, info } = data;

  return loading ? (
    <Loader />
  ) : (
    <section className="fill-h o-section o-section--header  t-section  t-section--header">
      <div className="c-header">
        <div className="o-section__header-bg  t-section__header"></div>
        <div className="o-section__content-bg  t-section__content"></div>
        <div className="o-container">
          <div className="o-section__container">
            <header className="o-section__header  c-header__header  t-section__header">
              <div className="c-header__inner-header">
                <div className="c-header__avatar">
                  <div className="a-header  c-avatar in-view" data-sr-id="2">
                    <img className="c-avatar__img dense-image dense-ready animate__animated animate__backInLeft" src={avatar} alt={name} />
                  </div>
                </div>
              </div>
            </header>

            <div className="o-section__content  c-header__content  t-section__content">
              <div className="c-header__inner-content">
                <div className="c-header__top">
                  <div className="c-header__brand">
                    <div className="c-brand">
                      <h1 className="c-brand__title  t-title animate__animated animate__fadeInDown animate__delay-1s">
                        <span className="c-brand__sizer ">
                          <span className="a-header c-brand__first-word  t-title__first-word in-view" data-sr-id="3">
                            Hey I'm
                          </span>

                          <span className="a-header  c-brand__second-word  t-title__second-word in-view" data-sr-id="4">
                            {name}
                          </span>
                        </span>
                      </h1>

                      <h2 className="a-header  c-brand__sub-title  t-sub-title in-view  animate__animated animate__fadeInUp animate__delay-2s" data-sr-id="5">
                        <span className="c-brand__sizer" style={{ fontFamily: "Fira Code" }}>
                          {jobTitle}
                        </span>
                      </h2>
                    </div>
                  </div>

                  {/* Social Icons */}
                  <ul className="c-header__social-buttons  c-social-buttons animate__animated animate__backInRight">
                    {socials.map((social) => (
                      <SocialIcons key={social.appname} url={social.url} icon={social.appicon} />
                    ))}
                  </ul>
                </div>
                <div className="c-header__contact animate__animated animate__fadeInRight">
                  <hr className="a-header  c-header__contact-divider in-view" data-sr-id="11" />

                  <div className="o-grid">
                    <div className="o-grid__col-md-3 o-grid__col-sm-6">
                      <div className="a-header  o-content in-view" data-sr-id="12">
                        <div className="o-content__body">
                          <h4>Location</h4>
                          <address>New Delhi - IN</address>
                        </div>
                      </div>
                    </div>

                    {info.map((ck) => (
                      <ContactBlock key={ck.title} title={ck.title} value={ck.value} text={ck.text} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(App);
