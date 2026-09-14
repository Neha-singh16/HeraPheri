import { useEffect, useRef } from "react";

export default function GoogleSignInButton({
  onCredential,
  text = "signin_with",
}) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const initializedRef = useRef(false);
  const scriptRef = useRef(null);

  useEffect(() => {
    callbackRef.current = onCredential;

    function renderGoogleButton() {
      if (
        initializedRef.current ||
        !window.google ||
        !containerRef.current
      ) {
        return;
      }

      containerRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: (response) => callbackRef.current(response),

        auto_select: false,
      });

      initializedRef.current = true;

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

    if (scriptRef.current) {
      return;
    }

    const script = document.createElement("script");
    scriptRef.current = script;

    script.src = "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = renderGoogleButton;

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      if (scriptRef.current === script) {
        scriptRef.current = null;
      }
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
