import React from "react";

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        Terms & Conditions
      </h1>
      <p className="mb-4">
        Welcome to <strong>Shopora</strong>. By accessing or using our website,
        you agree to comply with and be bound by the following Terms and
        Conditions. Please read them carefully before using our services.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. General</h2>
      <p className="mb-4">
        These Terms & Conditions apply to all visitors, users, and customers of
        Shopora. By using our site, you agree to these terms. If you disagree
        with any part of the terms, you must not use our website.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        2. Products and Services
      </h2>
      <p className="mb-4">
        Shopora offers a variety of products for sale. We make every effort to
        display accurate product details, images, and pricing. However, we do
        not guarantee that product descriptions or other content are error-free.
        Shopora reserves the right to modify or discontinue any product without
        prior notice.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        3. Orders and Payments
      </h2>
      <p className="mb-4">
        By placing an order, you agree to provide accurate and complete
        information. All payments must be made through secure and approved
        payment gateways. We reserve the right to cancel or refuse any order if
        fraudulent activity or incorrect information is suspected.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        4. Shipping and Delivery
      </h2>
      <p className="mb-4">
        We aim to deliver your products within the estimated time frame.
        However, delivery times may vary based on location and other factors
        beyond our control. Shopora is not responsible for any delays caused by
        third-party logistics partners.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        5. Returns and Refunds
      </h2>
      <p className="mb-4">
        We accept returns for eligible products under specific conditions.
        Please refer to our Return Policy for details. Refunds are processed
        only after the returned product is inspected and approved.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. User Accounts</h2>
      <p className="mb-4">
        When creating an account, you must provide accurate information and keep
        your login details confidential. You are responsible for all activities
        under your account. Shopora reserves the right to suspend or terminate
        accounts that violate our policies.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        7. Intellectual Property
      </h2>
      <p className="mb-4">
        All content on this site, including logos, graphics, text, and images,
        is the property of Shopora and protected by applicable copyright and
        trademark laws. Unauthorized use of our content is strictly prohibited.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        8. Limitation of Liability
      </h2>
      <p className="mb-4">
        Shopora is not liable for any indirect, incidental, or consequential
        damages resulting from your use of our website or products. Our maximum
        liability for any claim is limited to the amount paid for the product in
        question.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        9. Changes to These Terms
      </h2>
      <p className="mb-4">
        Shopora reserves the right to update or modify these Terms & Conditions
        at any time without prior notice. Continued use of our website means you
        accept the updated terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">10. Contact Us</h2>
      <p>
        If you have any questions about these Terms & Conditions, please contact
        us at{" "}
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

export default Terms;
