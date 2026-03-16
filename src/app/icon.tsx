import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#236B47",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <line x1="11" y1="20" x2="11" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 10.5C11 10.5 6.5 9 6 3.5C6 3.5 11.5 3 14 7C15.5 9 14.5 10.8 11 10.5Z" fill="white" fillOpacity="0.92" />
          <path d="M11 15C11 15 15.5 12.5 18.5 15C18.5 15 17.5 20 13.5 20.5C11.5 20.8 10.5 17.5 11 15Z" fill="white" fillOpacity="0.65" />
        </svg>
      </div>
    ),
    size
  );
}
