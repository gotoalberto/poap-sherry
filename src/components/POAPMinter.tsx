"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { mainnet } from "viem/chains";
import { config } from "./providers/WagmiProvider";
import { checkIfUserFollows, checkIfUserRetweeted } from "~/lib/twitter";
import FollowGate from "./FollowGate";
import POAPSuccess from "./POAPSuccess";

interface SherryContext {
  user?: {
    id: string;
    username: string;
    name: string;
  };
  tweet?: {
    id: string;
    author: string;
  };
}

export default function POAPMinter() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [userHasModifiedAddress, setUserHasModifiedAddress] = useState<boolean>(false);
  const [claimStatus, setClaimStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [claimError, setClaimError] = useState<string>("");
  const [context, setContext] = useState<SherryContext | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [hasRetweeted, setHasRetweeted] = useState<boolean | null>(null);
  const [checkingFollow, setCheckingFollow] = useState(true);
  const [checkingRetweet, setCheckingRetweet] = useState(true);
  const [tweetAuthor, setTweetAuthor] = useState<string | null>(null);
  const [hasAlreadyClaimed, setHasAlreadyClaimed] = useState<boolean | null>(null);
  const [checkingClaim, setCheckingClaim] = useState(true);
  const [poapEventData, setPoapEventData] = useState<{name: string, image_url: string} | null>(null);
  const [isLoadingPoapData, setIsLoadingPoapData] = useState(true);
  const [showMintingScreen, setShowMintingScreen] = useState(false);
  const [savedMintingAddress, setSavedMintingAddress] = useState<string>("");

  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  // Switch to Mainnet if not already on it
  useEffect(() => {
    const switchToMainnet = async () => {
      if (isConnected && chainId !== mainnet.id) {
        try {
          await switchChainAsync({ chainId: mainnet.id });
        } catch (error) {
          console.error("Failed to switch to Mainnet:", error);
        }
      }
    };
    switchToMainnet();
  }, [chainId, switchChainAsync, isConnected]);

  // Set default wallet address when connected (only if not manually changed)
  useEffect(() => {
    if (address && walletAddress === "" && !userHasModifiedAddress) {
      setWalletAddress(address);
    }
  }, [address, walletAddress, userHasModifiedAddress]);

  // Fetch POAP event data
  useEffect(() => {
    const fetchPoapEventData = async () => {
      try {
        setIsLoadingPoapData(true);
        const response = await fetch('/api/poap-event');
        if (response.ok) {
          const data = await response.json();
          setPoapEventData(data);
        }
      } catch (error) {
        console.error('Error fetching POAP event data:', error);
      } finally {
        setIsLoadingPoapData(false);
      }
    };

    fetchPoapEventData();
  }, []);

  // Sherry SDK Integration
  useEffect(() => {
    const initSherry = async () => {
      // Check if we're inside a Sherry mini-app context
      if (typeof window !== 'undefined' && (window as any).sherry) {
        const sherry = (window as any).sherry;
        
        // Get context from Sherry SDK
        const context = await sherry.getContext();
        if (context) {
          setContext({
            user: context.user,
            tweet: context.tweet
          });
          setTweetAuthor(context.tweet?.author || null);
        }
        
        // Notify Sherry that the mini-app is ready
        await sherry.ready();
        setIsSDKLoaded(true);
      } else {
        // For testing without Sherry context
        console.log("Running without Sherry context");
        setIsSDKLoaded(true);
        setCheckingFollow(false);
        setCheckingRetweet(false);
        setCheckingClaim(false);
      }
    };

    initSherry();
  }, []);

  // Check if user follows required account, has retweeted, and hasn't already claimed
  useEffect(() => {
    const checkRequirements = async () => {
      console.log("[POAPMinter] Starting requirements check, context:", context);
      
      if (!context?.user) {
        console.log("[POAPMinter] No context or user found, skipping requirements check");
        setCheckingFollow(false);
        setCheckingRetweet(false);
        setCheckingClaim(false);
        setIsFollowing(null);
        setHasRetweeted(null);
        setHasAlreadyClaimed(null);
        return;
      }

      console.log(`[POAPMinter] User ID: ${context.user.id}, checking requirements...`);
      
      try {
        const requiredUsername = process.env.NEXT_PUBLIC_REQUIRED_FOLLOW_USERNAME || "gotoalberto";
        const tweetId = context.tweet?.id;
        
        // Check follow, retweet, and claim status in parallel
        const [follows, retweeted, claimResponse] = await Promise.all([
          checkIfUserFollows(context.user.id, requiredUsername),
          tweetId ? checkIfUserRetweeted(context.user.id, tweetId) : Promise.resolve(false),
          fetch("/api/poap-claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: context.user.id })
          })
        ]);
        
        // Process claim check response
        let hasClaimedThisEvent = false;
        let savedAddress = '';
        if (claimResponse.ok) {
          const claimData = await claimResponse.json();
          hasClaimedThisEvent = claimData.claimed;
          savedAddress = claimData.address || '';
        } else {
          console.error("[POAPMinter] Error checking claim status:", await claimResponse.text());
        }
        
        // Set the saved address if user has already claimed and hasn't manually changed address
        if (hasClaimedThisEvent && savedAddress) {
          setSavedMintingAddress(savedAddress);
          if (!userHasModifiedAddress) {
            setWalletAddress(savedAddress);
          }
        }
        
        console.log(`[POAPMinter] Follow check result: ${follows}`);
        console.log(`[POAPMinter] Retweet check result: ${retweeted}`);
        console.log(`[POAPMinter] Already claimed check result: ${hasClaimedThisEvent}`);
        
        setIsFollowing(follows);
        setHasRetweeted(retweeted);
        setHasAlreadyClaimed(hasClaimedThisEvent);
      } catch (error) {
        console.error("[POAPMinter] Error checking requirements:", error);
        setIsFollowing(false);
        setHasRetweeted(false);
        setHasAlreadyClaimed(false);
      } finally {
        setCheckingFollow(false);
        setCheckingRetweet(false);
        setCheckingClaim(false);
      }
    };

    if (context) {
      checkRequirements();
    }
  }, [context, userHasModifiedAddress]);

  const mintPoap = async () => {
    if (!walletAddress) {
      setClaimError("Wallet address is required");
      return;
    }

    if (!context?.user?.id) {
      setClaimError("Twitter user information is required");
      return;
    }

    try {
      setClaimStatus("loading");
      setClaimError("");
      
      const response = await fetch("/api/claim-poap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          userId: context.user.id,
          username: context.user.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim POAP");
      }

      setClaimStatus("success");
    } catch (error) {
      setClaimStatus("error");
      setClaimError(error instanceof Error ? error.message : 'Failed to claim POAP');
    }
  };

  const handleFollowComplete = async () => {
    // Recheck follow, retweet, and claim status
    if (context?.user) {
      setCheckingFollow(true);
      setCheckingRetweet(true);
      setCheckingClaim(true);
      try {
        const requiredUsername = process.env.NEXT_PUBLIC_REQUIRED_FOLLOW_USERNAME || "gotoalberto";
        const tweetId = context.tweet?.id;
        
        const [follows, retweeted, claimResponse] = await Promise.all([
          checkIfUserFollows(context.user.id, requiredUsername),
          tweetId ? checkIfUserRetweeted(context.user.id, tweetId) : Promise.resolve(false),
          fetch("/api/poap-claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: context.user.id })
          })
        ]);
        
        // Process claim check response
        let hasClaimedThisEvent = false;
        let savedAddress = '';
        if (claimResponse.ok) {
          const claimData = await claimResponse.json();
          hasClaimedThisEvent = claimData.claimed;
          savedAddress = claimData.address || '';
        }
        
        // Set the saved address if user has already claimed and hasn't manually changed address
        if (hasClaimedThisEvent && savedAddress) {
          setSavedMintingAddress(savedAddress);
          if (!userHasModifiedAddress) {
            setWalletAddress(savedAddress);
          }
        }
        
        console.log(`[POAPMinter] Manual recheck - Follow: ${follows}, Retweet: ${retweeted}, Claimed: ${hasClaimedThisEvent}`);
        setIsFollowing(follows);
        setHasRetweeted(retweeted);
        setHasAlreadyClaimed(hasClaimedThisEvent);
      } catch (error) {
        console.error("[POAPMinter] Error in manual recheck:", error);
        setIsFollowing(false);
        setHasRetweeted(false);
        setHasAlreadyClaimed(false);
      } finally {
        setCheckingFollow(false);
        setCheckingRetweet(false);
        setCheckingClaim(false);
      }
    }
  };

  const handleClaimPoapClick = () => {
    // Navigate to minting screen when user clicks "Claim POAP" from FollowGate
    setShowMintingScreen(true);
  };

  // Show loading while checking requirements
  if (checkingFollow || checkingRetweet || checkingClaim) {
    return (
      <div className="loading-container">
        <div className="spinner-large" />
        <p>Checking requirements...</p>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .spinner-large {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(124, 58, 237, 0.2);
            border-radius: 50%;
            border-top-color: #7c3aed;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Show success page if user has already claimed this POAP event
  if (hasAlreadyClaimed === true) {
    return (
      <POAPSuccess 
        walletAddress={savedMintingAddress || walletAddress}
      />
    );
  }

  // Show FollowGate unless user has clicked "Claim POAP" to proceed to minting
  if (!showMintingScreen) {
    return (
      <FollowGate 
        username={process.env.NEXT_PUBLIC_REQUIRED_FOLLOW_USERNAME || "gotoalberto"}
        tweetId={context?.tweet?.id}
        tweetAuthor={tweetAuthor}
        isFollowing={isFollowing}
        hasRetweeted={hasRetweeted}
        onFollowComplete={handleFollowComplete}
        onClaimPoapClick={handleClaimPoapClick}
      />
    );
  }

  // Show success page if POAP was just minted successfully
  if (claimStatus === "success") {
    return (
      <POAPSuccess 
        walletAddress={walletAddress}
      />
    );
  }

  return (
    <div className="poap-minter-container">
      <div className="frame-container">
        <div className="white-text-horizontal">
          <img className="group" src="/group0.svg" alt="" />
          <img className="group2" src="/group1.svg" alt="" />
        </div>
        <div className="card">
          <div className="header">
            <div className="get-your-poap">
              Get your<br />{poapEventData?.name || 'POAP'}
            </div>
            <div className="poap-image-container">
              {isLoadingPoapData ? (
                <div className="poap-image-skeleton">
                  <div className="skeleton-pulse"></div>
                </div>
              ) : poapEventData?.image_url ? (
                <img 
                  className="poap-image" 
                  src={poapEventData.image_url} 
                  alt="POAP" 
                />
              ) : (
                <div className="poap-image-error">
                  <div className="error-icon">⚠️</div>
                  <div className="error-text">Unable to load POAP image</div>
                </div>
              )}
            </div>
          </div>
          <div className="body">
            <div className="content">
              <div className="text">
                <div className="title">
                  <div className="mint-title">Mint Your POAP</div>
                </div>
                <div className="mint-description">
                  Enter your wallet address to claim your commemorative POAP token.
                </div>
              </div>
              <div className="mint-form">
                <div className="form-field">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => {
                      setWalletAddress(e.target.value);
                      setUserHasModifiedAddress(true);
                    }}
                    placeholder="Enter wallet address (e.g., 0x...)"
                    className="wallet-input"
                    disabled={claimStatus === "loading"}
                  />
                </div>
                
                {claimStatus === "error" && (
                  <div className="error-message">
                    {claimError}
                  </div>
                )}
              </div>
            </div>
            <div className="cta">
              {!isConnected ? (
                <button
                  type="button"
                  onClick={() => connect({ connector: config.connectors[0] })}
                  disabled={isConnecting}
                  className={`mint-button ${isConnecting ? 'loading' : ''}`}
                >
                  {isConnecting ? (
                    <>
                      <div className="spinner" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={mintPoap}
                  disabled={claimStatus === "loading" || !walletAddress}
                  className={`mint-button ${claimStatus === "loading" ? 'loading' : ''}`}
                >
                  {claimStatus === "loading" ? (
                    <>
                      <div className="spinner" />
                      <span>Minting...</span>
                    </>
                  ) : (
                    "Mint POAP"
                  )}
                </button>
              )}
              <div className="mint-note">
                This POAP celebrates the Twitter community and our journey together.
              </div>
            </div>
          </div>
          <img className="background" src="/background0.svg" alt="" />
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
          border: none;
          text-decoration: none;
          background: none;
          -webkit-font-smoothing: antialiased;
        }

        html, body {
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
        }
        
        * {
          max-width: 100%;
        }

        .poap-minter-container {
          width: 100%;
          max-width: 390px;
          min-height: 100vh;
          background: url('/background.jpg') center;
          background-size: cover;
          background-repeat: no-repeat;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          font-family: 'Unica77LlTt', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0 auto;
          padding: 20px 0 40px 0;
        }

        .frame-container {
          width: 100%;
          max-width: 342px;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          justify-content: flex-start;
          margin-top: auto;
          margin-bottom: auto;
          box-sizing: border-box;
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
          padding: 24px 16px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 20px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .get-your-poap {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
          text-align: center;
        }

        .poap-image-container {
          width: 100%;
          max-width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .poap-image {
          width: 100%;
          max-width: 200px;
          height: 200px;
          border-radius: 50%;
          object-fit: cover;
        }

        .poap-image-skeleton {
          width: 100%;
          max-width: 200px;
          height: 200px;
          border-radius: 50%;
          background: #1a1c1d;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .skeleton-pulse {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: skeleton-loading 1.5s infinite;
        }

        .poap-image-error {
          width: 100%;
          max-width: 200px;
          height: 200px;
          border-radius: 50%;
          background: #1a1c1d;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .error-icon {
          font-size: 32px;
        }

        .error-text {
          color: #c6c6c6;
          font-size: 12px;
          text-align: center;
          font-weight: 400;
        }

        @keyframes skeleton-loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .title {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mint-title {
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
        }

        .mint-description {
          color: #c6c6c6;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
          text-align: center;
        }

        .mint-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-field {
          background: #1a1c1d;
          border-radius: 8px;
          padding: 12px;
        }

        .wallet-input {
          width: 100%;
          background: transparent;
          color: #ffffff;
          font-size: 15px;
          font-weight: 400;
          border: none;
          outline: none;
          font-family: inherit;
        }

        .wallet-input::placeholder {
          color: #c6c6c6;
          opacity: 1;
        }

        .wallet-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: #ff6b6b;
          font-size: 14px;
          font-weight: 400;
          text-align: center;
          padding: 8px;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(255, 107, 107, 0.2);
        }

        .cta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          margin-bottom: 20px;
        }

        .mint-button {
          width: 100%;
          max-width: 310px;
          padding: 16px;
          background: #0a5580;
          border-radius: 8px;
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .mint-button:hover:not(:disabled) {
          background: #0c6394;
          transform: translateY(-1px);
        }

        .mint-button:disabled {
          background: #073d5c;
          color: #5c727f;
          cursor: not-allowed;
          transform: none;
        }

        .mint-button.loading {
          background: linear-gradient(
            90deg,
            #0a5580,
            #0c6394,
            #0e6ba8,
            #0c6394,
            #0a5580
          );
          background-size: 200% auto;
          animation: shine 2s linear infinite;
        }

        .mint-note {
          color: #c6c6c6;
          font-size: 13px;
          font-weight: 400;
          text-align: center;
          line-height: 1.4;
          width: 100%;
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

        @keyframes shine {
          from {
            background-position: 200% center;
          }
          to {
            background-position: -200% center;
          }
        }

        .background {
          width: 342px;
          height: 363px;
          position: absolute;
          left: 0px;
          top: -20px;
          overflow: visible;
        }
      `}</style>
    </div>
  );
}