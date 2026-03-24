export default function VerifyPage() {
  return (
    <section aria-labelledby="verify-heading">
      <h1 id="verify-heading" className="text-2xl font-bold mb-4">
        Verify your code
      </h1>
      <p className="text-gray-600">Enter the verification code sent to your phone or email.</p>
      <a href="/" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to events
      </a>
    </section>
  );
}
