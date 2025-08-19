"use client";

import { useState } from "react";
import Lottie from "lottie-react";
import animationData from "~/assets/animation.json";

interface FollowGateProps {
  username: string;
  tweetId?: string;
  tweetAuthor?: string | null;
  isFollowing: boolean | null;
  hasRetweeted: boolean | null;
  onFollowComplete: () => void;
  onClaimPoapClick: () => void;
}

export default function FollowGate({
  username,
  tweetId,
  tweetAuthor,
  isFollowing,
  hasRetweeted,
  onFollowComplete,
  onClaimPoapClick,
}: FollowGateProps) {
  const [isRechecking, setIsRechecking] = useState(false);

  const handleFollowClick = () => {
    // Open Twitter follow page in new tab
    window.open(`https://twitter.com/intent/follow?screen_name=${username}`, '_blank');
  };

  const handleRetweetClick = () => {
    // Open retweet intent if we have a tweet ID
    if (tweetId) {
      window.open(`https://twitter.com/intent/retweet?tweet_id=${tweetId}`, '_blank');
    }
  };

  const handleRecheck = async () => {
    setIsRechecking(true);
    await onFollowComplete();
    setIsRechecking(false);
  };

  const allRequirementsMet = isFollowing === true && (tweetId ? hasRetweeted === true : true);

  return (
    <div className="follow-gate-container">
      <div className="frame-container">
        <div className="white-text-horizontal">
          <img className="group" src="/group0.svg" alt="" />
          <img className="group2" src="/group1.svg" alt="" />
        </div>
        <div className="card">
          <div className="follow-header">
            <div className="title-section">
              <h1 className="title">Complete Steps to Claim Your POAP</h1>
              <p className="subtitle">
                Follow the steps below to unlock your commemorative POAP
              </p>
            </div>
          </div>

          <div className="steps-container">
            <div className={`step ${isFollowing === true ? 'completed' : ''}`}>
              <div className="step-indicator">
                {isFollowing === true ? (
                  <div className="checkmark">✓</div>
                ) : (
                  <div className="step-number">1</div>
                )}
              </div>
              <div className="step-content">
                <h3 className="step-title">Follow @{username}</h3>
                <p className="step-description">
                  Follow our Twitter account to stay updated
                </p>
                {isFollowing !== true && (
                  <button
                    onClick={handleFollowClick}
                    className="action-button primary"
                  >
                    <img src="/wallet1.svg" alt="" className="button-icon" />
                    Follow @{username}
                  </button>
                )}
              </div>
            </div>

            {tweetId && (
              <div className={`step ${hasRetweeted === true ? 'completed' : ''}`}>
                <div className="step-indicator">
                  {hasRetweeted === true ? (
                    <div className="checkmark">✓</div>
                  ) : (
                    <div className="step-number">2</div>
                  )}
                </div>
                <div className="step-content">
                  <h3 className="step-title">Retweet the Post</h3>
                  <p className="step-description">
                    Share the POAP announcement with your followers
                    {tweetAuthor && ` from @${tweetAuthor}`}
                  </p>
                  {hasRetweeted !== true && (
                    <button
                      onClick={handleRetweetClick}
                      className="action-button primary"
                    >
                      <img src="/copy0.svg" alt="" className="button-icon" />
                      Retweet
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {!allRequirementsMet && (
            <div className="recheck-section">
              <button
                onClick={handleRecheck}
                disabled={isRechecking}
                className="action-button secondary"
              >
                {isRechecking ? (
                  <>
                    <div className="spinner" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <img src="/frame0.svg" alt="" className="button-icon" />
                    Recheck Status
                  </>
                )}
              </button>
              <p className="recheck-note">
                Complete all steps and click recheck to continue
              </p>
            </div>
          )}

          {allRequirementsMet && (
            <div className="success-section">
              <div className="animation-container">
                <Lottie
                  animationData={animationData}
                  loop={false}
                  style={{ width: 120, height: 120 }}
                />
              </div>
              <h2 className="success-title">All Steps Completed!</h2>
              <p className="success-description">
                You're now eligible to claim your POAP
              </p>
              <button
                onClick={onClaimPoapClick}
                className="action-button success"
              >
                Claim POAP →
              </button>
            </div>
          )}
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

        .follow-gate-container {
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

        .follow-header {
          text-align: center;
        }

        .title-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .title {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
        }

        .subtitle {
          color: #c6c6c6;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #1a1c1d;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .step.completed {
          background: rgba(202, 242, 191, 0.1);
          border: 1px solid rgba(202, 242, 191, 0.2);
        }

        .step-indicator {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-number {
          width: 100%;
          height: 100%;
          background: #2a2c2e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
        }

        .checkmark {
          width: 100%;
          height: 100%;
          background: #CAF2BF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          font-size: 18px;
          font-weight: 700;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .step-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
        }

        .step-description {
          color: #c6c6c6;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.4;
        }

        .action-button {
          padding: 12px 24px;
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
          margin-top: 8px;
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .action-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .action-button.primary {
          background: #0a5580;
          color: #ffffff;
        }

        .action-button.primary:hover:not(:disabled) {
          background: #0c6394;
        }

        .action-button.secondary {
          background: #2a2c2e;
          color: #ffffff;
        }

        .action-button.secondary:hover:not(:disabled) {
          background: #3a3c3e;
        }

        .action-button.success {
          background: #CAF2BF;
          color: #000000;
          width: 100%;
          padding: 16px;
          font-size: 18px;
        }

        .action-button.success:hover:not(:disabled) {
          background: #b8e3ac;
        }

        .button-icon {
          width: 20px;
          height: 20px;
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

        .recheck-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
        }

        .recheck-note {
          color: #c6c6c6;
          font-size: 13px;
          font-weight: 400;
          text-align: center;
        }

        .success-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px 0;
        }

        .animation-container {
          width: 120px;
          height: 120px;
        }

        .success-title {
          color: #CAF2BF;
          font-size: 24px;
          font-weight: 700;
        }

        .success-description {
          color: #c6c6c6;
          font-size: 16px;
          font-weight: 400;
          text-align: center;
        }

        @media (max-height: 700px) {
          .follow-gate-container {
            align-items: flex-start;
            padding: 10px 0;
          }
          
          .card {
            gap: 20px;
            padding: 20px;
          }
          
          .steps-container {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}