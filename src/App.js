import React from "react";

function App() {
  return (
    <div className="App">
      <div
        className="c-main-container  js-main-container"
        style={{ display: "block" }}
      >
        {/*   ################################  
          ############ HEADER ############  
          ################################   */}
        <section className="o-section o-section--header  t-section  t-section--header">
          <div className="c-header">
            <div className="o-section__header-bg  t-section__header"></div>
            <div className="o-section__content-bg  t-section__content"></div>
            <div className="o-container">
              <div className="o-section__container">
                <header className="o-section__header  c-header__header  t-section__header">
                  <div className="c-header__inner-header">
                    <div className="c-header__avatar">
                      <div
                        className="a-header  c-avatar in-view"
                        data-sr-id="2"
                      >
                        <img
                          className="c-avatar__img dense-image dense-ready animate__animated animate__backInLeft"
                          src="./assets/images/Farukh.jpg"
                          alt="Farukh"
                        />
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
                              <span
                                className="a-header c-brand__first-word  t-title__first-word in-view"
                                data-sr-id="3"
                              >
                                Hey I'm
                              </span>

                              <span
                                className="a-header  c-brand__second-word  t-title__second-word in-view"
                                data-sr-id="4"
                              >
                                Farukh
                              </span>
                            </span>
                          </h1>
                          <h2
                            className="a-header  c-brand__sub-title  t-sub-title in-view  animate__animated animate__fadeInUp animate__delay-2s"
                            data-sr-id="5"
                          >
                            <span
                              className="c-brand__sizer"
                              style={{ fontFamily: "Fira Code" }}
                            >
                              Front-end Developer
                            </span>
                          </h2>
                        </div>
                      </div>
                      <ul className="c-header__social-buttons  c-social-buttons animate__animated animate__backInRight">
                        <li className="a-header in-view" data-sr-id="6">
                          <a
                            href="https://www.facebook.com/mdfarukh.saifi"
                            className="c-social-button  t-social-button"
                          >
                            <i className="fab  fa-lg  fa-facebook-f in-view"></i>
                          </a>
                        </li>
                        <li className="a-header in-view" data-sr-id="7">
                          <a
                            href="https://www.instagram.com/mdfarukhxaifi"
                            className="c-social-button  t-social-button"
                          >
                            <i className="fab  fa-lg  fa-instagram in-view"></i>
                          </a>
                        </li>
                        <li className="a-header in-view" data-sr-id="8">
                          <a
                            href="https://github.com/Farukh1x95"
                            className="c-social-button  t-social-button"
                          >
                            <i className="fab  fa-lg  fa-github in-view"></i>
                          </a>
                        </li>
                        <li className="a-header in-view" data-sr-id="9">
                          <a
                            href="https://twitter.com/iamfarukh1"
                            className="c-social-button  t-social-button"
                          >
                            <i className="fab  fa-lg  fa-twitter in-view"></i>
                          </a>
                        </li>
                        <li className="a-header in-view" data-sr-id="10">
                          <a
                            href="https://www.linkedin.com/in/farukh-saifi"
                            className="c-social-button  t-social-button"
                          >
                            <i className="fab  fa-lg  fa-linkedin-in in-view"></i>
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="c-header__contact animate__animated animate__fadeInRight">
                      {/* <hr className="a-header  c-header__contact-divider in-view" data-sr-id="11"
                                        style=" visibility: visible;  -webkit-transform: translateY(0) scale(1); opacity: 1;transform: translateY(0) scale(1); opacity: 1;-webkit-transition: -webkit-transform 1.2s ease 0.7s, opacity 1.2s ease 0.7s; transition: transform 1.2s ease 0.7s, opacity 1.2s ease 0.7s; "> */}

                      <div className="o-grid">
                        <div className="o-grid__col-md-3  o-grid__col-sm-6">
                          <div
                            className="a-header  o-content in-view"
                            data-sr-id="12"
                          >
                            <div className="o-content__body">
                              <h4>Location</h4>
                              <address>New Delhi - IN</address>
                            </div>
                          </div>
                        </div>

                        <div className="o-grid__col-md-3  o-grid__col-sm-6 ">
                          <div
                            className="a-header  o-content in-view"
                            data-sr-id="13"
                          >
                            <div className="o-content__body">
                              <a
                                href="tel:9810844673"
                                className="t-link-container"
                              >
                                <h4>Phone</h4>
                                <p className="t-link-container__item--blended">
                                  Wanna Talk
                                </p>
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="o-grid__col-md-3  o-grid__col-sm-6">
                          <div
                            className="a-header  o-content in-view"
                            data-sr-id="15"
                          >
                            <div className="o-content__body">
                              <a
                                href="https://farukh.me"
                                className="t-link-container"
                              >
                                <h4>Web</h4>
                                <p>
                                  <span className="t-link-container__item--blended">
                                    farukh.me
                                  </span>
                                </p>
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="o-grid__col-md-3  o-grid__col-sm-6">
                          <div
                            className="a-header  o-content in-view"
                            data-sr-id="16"
                          >
                            <div className="o-content__body">
                              <a
                                href="mailto:farook1x95@gmail.com"
                                className="t-link-container"
                              >
                                <h4>Email</h4>
                                <p>
                                  <span className="t-link-container__item--blended">
                                    farook1x95@gmail.com
                                  </span>
                                </p>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
