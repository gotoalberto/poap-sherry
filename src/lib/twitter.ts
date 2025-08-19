// Twitter API utilities for user verification and tweet validation

const TWITTER_API_BASE = "https://api.twitter.com/2";
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export interface Tweet {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
}

const headers = {
  Authorization: `Bearer ${BEARER_TOKEN}`,
  "Content-Type": "application/json",
};

export async function getUserByUsername(username: string): Promise<TwitterUser | null> {
  try {
    const response = await fetch(
      `${TWITTER_API_BASE}/users/by/username/${username}`,
      { headers }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching Twitter user:", error);
    return null;
  }
}

export async function checkIfUserFollows(userId: string, targetUsername: string): Promise<boolean> {
  try {
    // Get target user ID
    const targetUser = await getUserByUsername(targetUsername);
    if (!targetUser) return false;

    // Check if user follows target
    const response = await fetch(
      `${TWITTER_API_BASE}/users/${userId}/following?user.fields=id,username`,
      { headers }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.data?.some((user: TwitterUser) => user.id === targetUser.id) || false;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

export async function checkIfUserRetweeted(userId: string, tweetId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${TWITTER_API_BASE}/tweets/${tweetId}/retweeted_by`,
      { headers }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.data?.some((user: TwitterUser) => user.id === userId) || false;
  } catch (error) {
    console.error("Error checking retweet status:", error);
    return false;
  }
}

export async function getTweetById(tweetId: string): Promise<Tweet | null> {
  try {
    const response = await fetch(
      `${TWITTER_API_BASE}/tweets/${tweetId}?tweet.fields=author_id,created_at`,
      { headers }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching tweet:", error);
    return null;
  }
}