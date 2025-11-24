'use client';

export default function FakeNewsButton() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Thank you for your feedback! This result has been flagged as TREMENDOUS fake news. The best people are looking into it. Believe me!');
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="text-gray-600 hover:underline"
      title="Flag this result as a complete and total Democrat HOAX! Sad!"
    >
      FAKE NEWS
    </a>
  );
}
