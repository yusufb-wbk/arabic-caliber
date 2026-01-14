import React, { useState, useEffect } from "react";
import { useLanguage } from "./contexts/LanguageContext";

function App() {
  const { language, toggleLanguage, t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [hasSunroof, setHasSunroof] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "+966 ",
    email: "",
    instagram: "@",
    carYear: "",
    carModel: "",
    sunroof: "",
    panoramicSunroof: "",
    electricSunroof: "",
    manualSunroof: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    if (!email.includes("@")) {
      return { isValid: false, message: t("emailMustContainAt") };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return {
      isValid,
      message: isValid ? "" : t("emailInvalid"),
    };
  };

  const validatePhone = (phone) => {
    // Remove +966 prefix and spaces to validate the remaining digits
    const cleanPhone = phone.replace(/^\+966\s*/, "").replace(/\s+/g, "");
    const phoneRegex = /^[5-9][0-9]{8}$/;
    return phoneRegex.test(cleanPhone);
  };

  const validateForm = () => {
    const errors = {};

    // Required field validation
    if (!formData.name.trim()) {
      errors.name = t("nameRequired");
    }

    if (
      !formData.phone.trim() ||
      formData.phone.trim() === "+966" ||
      formData.phone.trim() === "+966 "
    ) {
      errors.phone = t("phoneRequired");
    } else if (!validatePhone(formData.phone)) {
      errors.phone = t("phoneInvalid");
    }

    if (!formData.email.trim()) {
      errors.email = t("emailRequired");
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.message === "Email must contain @ symbol"
          ? t("emailMustContainAt")
          : t("emailInvalid");
      }
    }

    if (!formData.carYear) {
      errors.carYear = t("carYearRequired");
    } else if (formData.carYear < 1990 || formData.carYear > 2025) {
      errors.carYear = t("carYearInvalid");
    }

    if (!formData.carModel.trim()) {
      errors.carModel = t("carModelRequired");
    }

    if (!formData.sunroof) {
      errors.sunroof = t("sunroofRequired");
    }

    if (formData.sunroof === "yes" && !formData.electricSunroof) {
      errors.electricSunroof = t("electricSunroofRequired");
    }

    if (formData.sunroof === "yes" && !formData.panoramicSunroof) {
      errors.panoramicSunroof = t("panoramicSunroofRequired");
    }

    if (formData.sunroof === "yes" && !formData.manualSunroof) {
      errors.manualSunroof = t("manualSunroofRequired");
    }

    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePhoneChange = (value) => {
    // Ensure the +966 prefix is always present
    if (!value.startsWith("+966 ")) {
      if (value.startsWith("+966")) {
        value = "+966 " + value.substring(4);
      } else {
        value = "+966 " + value.replace(/^\+966\s*/, "");
      }
    }

    // Extract only the digits after +966 and limit to 9 digits
    const digitsOnly = value.replace(/^\+966\s*/, "").replace(/\D/g, "");
    const limitedDigits = digitsOnly.substring(0, 9);

    // Reconstruct the phone number with +966 prefix
    const formattedValue = "+966 " + limitedDigits;

    handleInputChange("phone", formattedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/meeojqep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Form fields in order
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          instagram: formData.instagram,
          carYear: formData.carYear,
          carModel: formData.carModel,
          sunroof: formData.sunroof,
          panoramicSunroof: formData.panoramicSunroof,
          electricSunroof: formData.electricSunroof,
          manualSunroof: formData.manualSunroof,
          selected_package: selectedPackage,
          // Formspree configuration
          _subject: "New Quote Request - Arabic Caliber",
          _replyto: formData.email,
        }),
      });

      if (response.ok) {
        // Show custom success message
        setShowSuccess(true);
        setShowForm(false);
        // Reset form
        setFormData({
          name: "",
          phone: "+966 ",
          email: "",
          instagram: "@",
          carYear: "",
          carModel: "",
          sunroof: "",
          panoramicSunroof: "",
          electricSunroof: "",
          manualSunroof: "",
        });
        setHasSunroof("");
        setFormErrors({});
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setHasSunroof("");
    setFormData({
      name: "",
      phone: "+966 ",
      email: "",
      instagram: "@",
      carYear: "",
      carModel: "",
      sunroof: "",
      panoramicSunroof: "",
      electricSunroof: "",
      manualSunroof: "",
    });
    setFormErrors({});
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate background gradient based on scroll - much darker footer
  const getBackgroundStyle = () => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / totalHeight, 1);

    // Consistent gradient colors matching CSS
    const darkBlue = `#000425`; // Deep dark blue
    const brightBlue = `#062a8c`; // Brighter blue

    // Simple progression using the same gradient
    if (scrollProgress < 0.5) {
      // Gradient from dark to bright and back to dark
      return {
        background: `linear-gradient(135deg, ${darkBlue} 30%, ${brightBlue} 50%, ${darkBlue} 100%)`,
        transition: "background 0.3s ease-out",
        minHeight: "100vh",
      };
    } else {
      // Keep same gradient at footer
      return {
        background: `linear-gradient(135deg, ${darkBlue} 10%, ${brightBlue} 50%, ${darkBlue} 100%)`,
        transition: "background 0.3s ease-out",
        minHeight: "100vh",
      };
    }
  };

  return (
    <div
      className="min-h-screen text-white relative w-full"
      style={{
        ...getBackgroundStyle(),
        position: "relative",
        zIndex: 1,
      }}>
      {/* Language Switcher */}
      <div className={`fixed top-4 z-50 ${language === "ar" ? "left-4" : "right-4"}`}>
        <button
          onClick={toggleLanguage}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition font-semibold border-2 border-primary">
          {language === "en" ? "العربية" : "English"}
        </button>
      </div>

      {/* Stars Background - Fixed */}
      <div className="fixed inset-0 starry-night opacity-80 pointer-events-none z-0"></div>
      {/* Palm trees silhouette - Background left side */}
      <img
        src="/palm.png"
        alt="Palm trees silhouette"
        className="fixed bottom-[-40px] -left-10 pointer-events-none z-2"
        style={{
          height: "clamp(10vh, 400vw, 70vh)",
          width: "auto",
          maxWidth: "40vw",
          objectFit: "cover",
          objectPosition: "bottom",
          display: "block",
        }}
      />
      {/* Cheetah silhouette - Background right side */}
      <img
        src="/cheetah_shifted.png"
        alt="Cheetah silhouette"
        className="fixed bottom-0 right-0 pointer-events-none z-2"
        style={{
          height: "clamp(20vh, 100vw, 100vh)",
          width: "auto",
          maxWidth: "70vw",
          objectFit: "cover",
          objectPosition: "bottom",
          transform: "translateX(10%)",
          display: "block",
        }}
      />
      {/* Twinkling Stars - Fixed to cover entire page */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
        <div className="twinkling-star"></div>
      </div>

      {/* Header/Hero Section */}
      <header className="relative min-h-screen flex justify-center items-center section-padding z-10">
        {/* Logo and Title */}
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Arabic Caliber Logo */}
          <div className="">
            <img
              src="/Arabic caliber.png"
              alt="Arabic Caliber Logo"
              className="w-full max-w-lg mx-auto h-auto object-contain"
              style={{
                filter: "drop-shadow(0 0 0 transparent)",
                imageRendering: "crisp-edges",
              }}
            />
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("tagline")}
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center mb-24 sm:mb-32">
            <button
              className="btn-primary text-lg"
              onClick={() => {
                const packagesSection =
                  document.getElementById("packages-section");
                packagesSection?.scrollIntoView({ behavior: "smooth" });
              }}>
              {t("viewServices")}
            </button>
          </div>
        </div>
      </header>

      {/* The Experience Section */}
      <section className="relative py-10 section-padding z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-8 font-title">
            {t("theExperience")}
          </h2>
          <div className="bg-gray-800 rounded-lg p-8">
            <p className="text-gray-300 text-lg leading-relaxed">
              {t("experienceText")}
            </p>
          </div>
        </div>
      </section>

      {/* Craftsmanship & Installation Section */}
      <section className="relative py-10 section-padding z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-8 font-title">
            {t("craftsmanshipInstallation")}
          </h2>
          <div className="bg-gray-800 rounded-lg p-8">
            <p className="text-gray-300 text-lg leading-relaxed">
              {t("craftsmanshipText")}
            </p>
          </div>
        </div>
      </section>

      {/* Product Quality Section */}
      <section className="relative py-10 section-padding z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-16 font-title">
            {t("premiumStarLightTechnology")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Quality Point 1 */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 font-title">
                {t("premiumFiberOptics")}
              </h3>
              <p className="text-gray-300">
                {t("premiumFiberOpticsDesc")}
              </p>
            </div>

            {/* Quality Point 2 */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 font-title">
                {t("advancedLedTechnology")}
              </h3>
              <p className="text-gray-300">
                {t("advancedLedTechnologyDesc")}
              </p>
            </div>

            {/* Quality Point 3 */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 font-title">
                {t("professionalInstallation")}
              </h3>
              <p className="text-gray-300">
                {t("professionalInstallationDesc")}
              </p>
            </div>

            {/* Quality Point 4 */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 font-title">{t("smartControls")}</h3>
              <p className="text-gray-300">
                {t("smartControlsDesc")}
              </p>
            </div>

            {/* Quality Point 5 */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 font-title">
                {t("premiumVipCarCare")}
              </h3>
              <p className="text-gray-300">
                {t("premiumVipCarCareDesc")}
              </p>
            </div>

            {/* Quality Point 6 */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 font-title">{t("customPatterns")}</h3>
              <p className="text-gray-300">
                {t("customPatternsDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="packages-section"
        className="py-10 section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-8 font-title">
            {t("choosingStarlightConfig")}
          </h2>

          <p className="text-gray-300 text-center max-w-4xl mx-auto mb-16 text-lg leading-relaxed">
            {t("packagesIntro")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 500 Starlights */}
            <div className="bg-gray-800 p-8 rounded-lg hover:bg-gray-700 transition-colors duration-300 border-2 border-transparent hover:border-primary">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-1 font-title">
                  {t("starlights500")}
                </h3>
              </div>
              <p className="text-gray-300 mb-6 text-center">
                {t("starlights500Desc")}
              </p>
              <button
                className="w-full btn-primary"
                onClick={() => {
                  setSelectedPackage(`${t("starlights500")} - 500 SAR`);
                  setShowForm(true);
                }}>
                {t("choose500")}
              </button>
            </div>

            {/* 1000 Starlights */}
            <div className="bg-gray-800 p-8 rounded-lg hover:bg-gray-700 transition-colors duration-300 border-2 border-transparent hover:border-primary transform lg:scale-105">
              <div className="text-center mb-6">
                <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold mb-2 inline-block">
                  {t("mostPopular")}
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-1 font-title">
                  {t("starlights1000")}
                </h3>
              </div>
              <p className="text-gray-300 mb-6 text-center">
                {t("starlights1000Desc")}
              </p>
              <button
                className="w-full btn-primary"
                onClick={() => {
                  setSelectedPackage(`${t("starlights1000")} - 1000 SAR`);
                  setShowForm(true);
                }}>
                {t("choose1000")}
              </button>
            </div>

            {/* 1500 Starlights */}
            <div className="bg-gray-800 p-8 rounded-lg hover:bg-gray-700 transition-colors duration-300 border-2 border-transparent hover:border-primary">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-1 font-title">
                  {t("starlights1500")}
                </h3>
              </div>
              <p className="text-gray-300 mb-6 text-center">
                {t("starlights1500Desc")}
              </p>
              <button
                className="w-full btn-primary"
                onClick={() => {
                  setSelectedPackage(`${t("starlights1500")} - 1500 SAR`);
                  setShowForm(true);
                }}>
                {t("choose1500")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Section */}
      <section className="py-10 section-padding relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-8 font-title">
            {t("warranty")}
          </h2>
          <div className="bg-gray-800 rounded-lg p-8">
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              {t("warrantyText1")}
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t("warrantyText2")}
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-10 section-padding relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8 font-title">
            {t("whyChoose")}
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            {t("whyChooseText")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 font-title">{t("premiumQuality")}</h3>
              <p className="text-gray-400">
                {t("premiumQualityDesc")}
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 font-title">{t("fastService")}</h3>
              <p className="text-gray-400">
                {t("fastServiceDesc")}
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 font-title">
                {t("satisfactionGuaranteed")}
              </h3>
              <p className="text-gray-400">
                {t("satisfactionGuaranteedDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-10 section-padding relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8 font-title">
            {t("getInTouch")}
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            {t("contactText")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-800 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-primary font-title">
                {t("callUs")}
              </h3>
              <p className="text-gray-300 text-lg mb-2">+966 50 123 4567</p>
              <p className="text-gray-400">{t("available7Days")}</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-primary font-title">
                {t("emailUs")}
              </h3>
              <p className="text-gray-300 text-lg mb-2">
                info@arabiccaliber.com
              </p>
              <p className="text-gray-400">{t("quickResponse")}</p>
            </div>
          </div>

          <button
            className="btn-primary text-xl px-8 py-4"
            onClick={() => {
              const packagesSection =
                document.getElementById("packages-section");
              packagesSection?.scrollIntoView({ behavior: "smooth" });
            }}>
            {t("getAQuote")}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 section-padding relative z-10 border-t border-gray-700/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            {t("copyright")}
          </p>
        </div>
      </footer>

      {/* Quote Request Form Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary font-title">
                {t("getYourQuote")}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-white text-2xl">
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-primary/20 rounded-lg">
              <p className="text-sm text-gray-300">{t("selectedPackage")}:</p>
              <p className="font-semibold text-primary">{selectedPackage}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("fullName")} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:outline-none text-white ${
                    formErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-600 focus:border-primary"
                  }`}
                  placeholder={t("fullNamePlaceholder")}
                />
                {formErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("phoneNumber")} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:outline-none text-white ${
                    formErrors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-600 focus:border-primary"
                  }`}
                  placeholder={t("phonePlaceholder")}
                  maxLength={14}
                />
                {formErrors.phone && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("emailAddress")} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:outline-none text-white ${
                    formErrors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-600 focus:border-primary"
                  }`}
                  placeholder={t("emailPlaceholder")}
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("instagramHandle")}
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={(e) =>
                    handleInputChange("instagram", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-primary focus:outline-none text-white"
                  placeholder={t("instagramPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Car Year *
                </label>
                <input
                  type="number"
                  name="carYear"
                  value={formData.carYear}
                  onChange={(e) => handleInputChange("carYear", e.target.value)}
                  onWheel={(e) => {
                    e.preventDefault();
                    e.target.blur();
                  }}
                  min="1990"
                  max="2025"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:outline-none text-white ${
                    formErrors.carYear
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-600 focus:border-primary"
                  }`}
                  placeholder={t("carYearPlaceholder")}
                />
                {formErrors.carYear && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.carYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("carModel")} *
                </label>
                <input
                  type="text"
                  name="carModel"
                  value={formData.carModel}
                  onChange={(e) =>
                    handleInputChange("carModel", e.target.value)
                  }
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:outline-none text-white ${
                    formErrors.carModel
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-600 focus:border-primary"
                  }`}
                  placeholder={t("carModelPlaceholder")}
                />
                {formErrors.carModel && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.carModel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("hasSunroof")} *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sunroof"
                      value="yes"
                      checked={formData.sunroof === "yes"}
                      className="accent-primary"
                      onChange={(e) => {
                        handleInputChange("sunroof", e.target.value);
                        setHasSunroof(e.target.value);
                      }}
                    />
                    <span className="text-white">{t("yes")}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sunroof"
                      value="no"
                      checked={formData.sunroof === "no"}
                      className="accent-primary"
                      onChange={(e) => {
                        handleInputChange("sunroof", e.target.value);
                        setHasSunroof(e.target.value);
                      }}
                    />
                    <span className="text-white">{t("no")}</span>
                  </label>
                </div>
                {formErrors.sunroof && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.sunroof}
                  </p>
                )}
              </div>

              {/* Conditional Sunroof Questions */}
              {hasSunroof === "yes" && (
                <>
                  {/* Panoramic Sunroof Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Is it panoramic sunroof? *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="panoramicSunroof"
                          value="yes"
                          checked={formData.panoramicSunroof === "yes"}
                          className="accent-primary"
                          onChange={(e) =>
                            handleInputChange(
                              "panoramicSunroof",
                              e.target.value
                            )
                          }
                        />
                        <span className="text-white">Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="panoramicSunroof"
                          value="no"
                          checked={formData.panoramicSunroof === "no"}
                          className="accent-primary"
                          onChange={(e) =>
                            handleInputChange(
                              "panoramicSunroof",
                              e.target.value
                            )
                          }
                        />
                        <span className="text-white">No</span>
                      </label>
                    </div>
                    {formErrors.panoramicSunroof && (
                      <p className="text-red-400 text-sm mt-1">
                        {formErrors.panoramicSunroof}
                      </p>
                    )}
                  </div>

                  {/* Electric Sunroof Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t("isElectric")} *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="electricSunroof"
                          value="yes"
                          checked={formData.electricSunroof === "yes"}
                          className="accent-primary"
                          onChange={(e) =>
                            handleInputChange("electricSunroof", e.target.value)
                          }
                        />
                        <span className="text-white">{t("yes")}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="electricSunroof"
                          value="no"
                          checked={formData.electricSunroof === "no"}
                          className="accent-primary"
                          onChange={(e) =>
                            handleInputChange("electricSunroof", e.target.value)
                          }
                        />
                        <span className="text-white">{t("no")}</span>
                      </label>
                    </div>
                    {formErrors.electricSunroof && (
                      <p className="text-red-400 text-sm mt-1">
                        {formErrors.electricSunroof}
                      </p>
                    )}
                  </div>

                  {/* Manual Sunroof Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t("isManual")} *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="manualSunroof"
                          value="yes"
                          checked={formData.manualSunroof === "yes"}
                          className="accent-primary"
                          onChange={(e) =>
                            handleInputChange("manualSunroof", e.target.value)
                          }
                        />
                        <span className="text-white">{t("yes")}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="manualSunroof"
                          value="no"
                          checked={formData.manualSunroof === "no"}
                          className="accent-primary"
                          onChange={(e) =>
                            handleInputChange("manualSunroof", e.target.value)
                          }
                        />
                        <span className="text-white">{t("no")}</span>
                      </label>
                    </div>
                    {formErrors.manualSunroof && (
                      <p className="text-red-400 text-sm mt-1">
                        {formErrors.manualSunroof}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? t("submitting") : t("getQuote")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-primary mb-4 font-title">
                {t("thankYou")}
              </h3>
              <p className="text-xl text-gray-300 mb-2">
                {t("successMessage")}
              </p>
              <p className="text-gray-400">
                {t("successMessage2")}
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full btn-primary text-lg py-3">
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
