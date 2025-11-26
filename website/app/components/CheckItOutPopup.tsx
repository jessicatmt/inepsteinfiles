'use client';

interface CheckItOutPopupProps {
  popupText: string;
}

export default function CheckItOutPopup({ popupText }: CheckItOutPopupProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert(popupText);
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="underline hover:text-gray-500"
    >
      Check it out.
    </a>
  );
}
