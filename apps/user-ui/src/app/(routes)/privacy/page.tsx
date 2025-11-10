import React from "react";

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Privacy Policy</h1>
      <p className="mb-4">
        Welcome to <strong>Shopora</strong>. Your privacy is important to us.
        This Privacy Policy explains how we collect, use, and protect your
        personal information when you use our website and services.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        We collect personal information that you provide directly to us, such as
        your name, email address, shipping address, and payment details when you
        make a purchase or create an account. We may also collect non-personal
        data such as your browser type, device information, and pages visited to
        help improve your shopping experience.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">We use your information to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Process and deliver your orders.</li>
        <li>Communicate with you about your purchases or account.</li>
        <li>Provide customer support and improve our services.</li>
        <li>Send promotional offers and updates (if you have opted in).</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        3. Information Sharing
      </h2>
      <p className="mb-4">
        We do not sell or rent your personal information to third parties.
        However, we may share your data with trusted service providers who
        assist us in operations such as payment processing, delivery, and
        marketing — under strict confidentiality agreements.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Data Security</h2>
      <p className="mb-4">
        We use secure technologies and procedures to protect your personal
        information from unauthorized access, use, or disclosure. However,
        please note that no online data transmission is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal data at
        any time. You can also unsubscribe from our marketing communications by
        following the instructions in our emails.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        6. Changes to This Policy
      </h2>
      <p className="mb-4">
        Shopora reserves the right to update or modify this Privacy Policy at
        any time. We encourage you to review this page periodically to stay
        informed about how we are protecting your information.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy, please
        contact us at{" "}
        <a
          href="mailto:support@shopora.com"
          className="text-green-600 underline"
        >
          support@shopora.com
        </a>
        .
      </p>

      <p className="mt-6 text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default Privacy;
