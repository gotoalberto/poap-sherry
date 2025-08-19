"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "~/assets/animation.json";

interface POAPSuccessProps {
  walletAddress: string;
}

export default function POAPSuccess({ walletAddress }: POAPSuccessProps) {
  const [poapData, setPoapData] = useState<{
    name: string;
    image_url: string;
    event_url: string;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Fetch POAP event data
    const fetchPoapData = async () => {
      try {
        const response = await fetch('/api/poap-event');
        if (response.ok) {
          const data = await response.json();
          setPoapData(data);
        }
      } catch (error) {
        console.error('Error fetching POAP data:', error);
      }
    };

    fetchPoapData();
  }, []);

  const handleDownloadImage = async () => {
    if (!poapData?.image_url) return;

    setIsDownloading(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: poapData.image_url,
          fileName: `${poapData.name.replace(/\s+/g, '-')}-POAP.png`
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${poapData.name.replace(/\s+/g, '-')}-POAP.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewOnPOAP = () => {
    window.open(`https://app.poap.xyz/scan/${walletAddress}`, '_blank');
  };

  const handleShareOnTwitter = () => {
    const text = `I just claimed my ${poapData?.name || 'POAP'} badge! 🎉\n\nCheck out my collection:`;
    const url = `https://app.poap.xyz/scan/${walletAddress}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="success-container">
      <div className="frame-container">
        <div className="white-text-horizontal">
          <img className="group" src="/group0.svg" alt="" />
          <img className="group2" src="/group1.svg" alt="" />
        </div>
        <div className="card">
          <div className="success-header">
            <div className="animation-wrapper">
              <Lottie
                animationData={animationData}
                loop={false}
                style={{ width: 150, height: 150 }}
              />
            </div>
            <h1 className="success-title">POAP Claimed Successfully!</h1>
            <p className="success-subtitle">
              Your POAP has been minted to your wallet
            </p>
          </div>

          <div className="poap-display">
            {poapData?.image_url && (
              <img 
                src={poapData.image_url} 
                alt={poapData.name}
                className="poap-image"
              />
            )}
            <div className="poap-info">
              <h2 className="poap-name">{poapData?.name || 'Your POAP'}</h2>
              <div className="wallet-info">
                <span className="label">Minted to:</span>
                <span className="address">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              onClick={handleViewOnPOAP}
              className="action-button primary"
            >
              View on POAP App
            </button>
            
            <button
              onClick={handleShareOnTwitter}
              className="action-button secondary"
            >
              Share on Twitter
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloading || !poapData?.image_url}
              className="action-button secondary"
            >
              {isDownloading ? (
                <>
                  <div className="spinner" />
                  <span>Downloading...</span>
                </>
              ) : (
                'Download Image'
              )}
            </button>
          </div>

          <div className="footer-note">
            <p>
              Your POAP is now part of your permanent collection. You can view all your POAPs
              anytime at <a href={`https://app.poap.xyz/scan/${walletAddress}`} target="_blank" rel="noopener noreferrer">app.poap.xyz</a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Unica77LlTt';
          src: url('/fonts/Unica77LLWeb-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'Unica77LlTt';
          src: url('/fonts/Unica77LLWeb-Bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .success-container {
          width: 100%;
          max-width: 390px;
          min-height: 100vh;
          background: url('/background.jpg') center;
          background-size: cover;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          position: relative;
          font-family: 'Unica77LlTt', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0 auto;
          padding: 20px 0;
        }

        .frame-container {
          width: 100%;
          max-width: 342px;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

        .white-text-horizontal {
          flex-shrink: 0;
          width: 200px;
          height: 51px;
          position: relative;
          overflow: hidden;
        }

        .group {
          width: 22.56%;
          height: 100%;
          position: absolute;
          right: 77.44%;
          left: 0%;
          bottom: 0%;
          top: 0%;
        }

        .group2 {
          width: 71.96%;
          height: 25.71%;
          position: absolute;
          right: -0.03%;
          left: 28.06%;
          bottom: 37.14%;
          top: 37.14%;
        }

        .card {
          background: #000000;
          border-radius: 12px;
          padding: 24px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .success-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .animation-wrapper {
          width: 150px;
          height: 150px;
        }

        .success-title {
          color: #CAF2BF;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }

        .success-subtitle {
          color: #c6c6c6;
          font-size: 16px;
          font-weight: 400;
        }

        .poap-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: #1a1c1d;
          border-radius: 12px;
        }

        .poap-image {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          object-fit: cover;
        }

        .poap-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .poap-name {
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
        }

        .wallet-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label {
          color: #c6c6c6;
          font-size: 14px;
          font-weight: 400;
        }

        .address {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          font-family: monospace;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-button {
          width: 100%;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          font-family: inherit;
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .action-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .action-button.primary {
          background: #CAF2BF;
          color: #000000;
        }

        .action-button.primary:hover:not(:disabled) {
          background: #b8e3ac;
        }

        .action-button.secondary {
          background: #2a2c2e;
          color: #ffffff;
        }

        .action-button.secondary:hover:not(:disabled) {
          background: #3a3c3e;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .footer-note {
          text-align: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .footer-note p {
          color: #c6c6c6;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.5;
        }

        .footer-note a {
          color: #CAF2BF;
          text-decoration: none;
          font-weight: 600;
        }

        .footer-note a:hover {
          text-decoration: underline;
        }

        @media (max-height: 700px) {
          .success-container {
            align-items: flex-start;
            padding: 10px 0;
          }
          
          .animation-wrapper {
            width: 100px;
            height: 100px;
          }
          
          .poap-image {
            width: 140px;
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
}