import { useEffect } from "react";

const DEFAULT_CLIENT = "ca-pub-5630866926852508";
const DEFAULT_SLOT = "6722203474";

const AdComponent = ({
  slot = DEFAULT_SLOT,
  format = "auto",
  responsive = true,
  className = "",
}) => {
  useEffect(() => {
    const pushAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    };

    const timer = setTimeout(pushAd, 0);
    return () => clearTimeout(timer);
  }, [slot, format, responsive]);

  return (
    <ins
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: "block", width: "100%" }}
      data-ad-client={DEFAULT_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
};

export default AdComponent;
