"use client";

const PHONE_NUMBER = "233248632153"; // +233 24 863 2153, no spaces or plus sign
const DEFAULT_MESSAGE = "Hi Aaron! I'd like to ask about your piano courses.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Aaron on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-xl hover:scale-105 active:scale-95 transition-transform"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping" />
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="white"
        className="relative z-10"
      >
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.29.638 4.432 1.744 6.262L4 29l7.94-1.703A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818a9.77 9.77 0 0 1-4.98-1.362l-.357-.213-4.71 1.01 1.005-4.59-.233-.373A9.78 9.78 0 0 1 6.182 15c0-5.415 4.404-9.818 9.819-9.818 5.414 0 9.818 4.403 9.818 9.818 0 5.414-4.404 9.818-9.818 9.818zm5.4-7.35c-.296-.148-1.75-.864-2.022-.963-.271-.099-.469-.148-.667.148-.198.297-.766.963-.939 1.161-.173.198-.346.223-.642.075-.297-.149-1.253-.462-2.386-1.472-.882-.787-1.478-1.76-1.651-2.057-.173-.297-.019-.457.13-.605.133-.133.297-.347.445-.52.148-.174.198-.298.297-.496.099-.198.05-.372-.025-.52-.074-.149-.667-1.608-.914-2.203-.24-.579-.485-.5-.667-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.478s1.065 2.874 1.213 3.072c.148.198 2.096 3.2 5.078 4.487.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.75-.715 1.997-1.406.247-.69.247-1.283.173-1.406-.074-.124-.271-.198-.568-.347z" />
      </svg>
    </a>
  );
}
