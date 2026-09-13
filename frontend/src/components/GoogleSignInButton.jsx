import { useEffect, useRef } from "react";

export default function GoogleSignInButton({
  onCredential,
  text = "signin_with",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    function renderGoogleButton() {
      if (!window.google || !containerRef.current) {
        return;
      }

      containerRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: onCredential,

        auto_select: false,
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text,
        shape: "rectangular",
        logo_alignment: "left",
      });
    }

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = renderGoogleButton;

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [onCredential, text]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    />
  );
}
