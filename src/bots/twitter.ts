import Twitter from "twitter";

const {
  TWITTER_ACCES_TOKEN,
  TWITTER_ACCES_TOKEN_SECRET,
  TWITTER_CONSUMER,
  TWITTER_CONSUMER_SECRET,
} = process.env;


if(!TWITTER_ACCES_TOKEN || !TWITTER_ACCES_TOKEN_SECRET || !TWITTER_CONSUMER || !TWITTER_CONSUMER_SECRET) process.exit(100);


export const twitter: Twitter = new Twitter({
  consumer_key: TWITTER_CONSUMER!,
  consumer_secret: TWITTER_CONSUMER_SECRET!,
  access_token_key: TWITTER_ACCES_TOKEN!,
  access_token_secret: TWITTER_ACCES_TOKEN_SECRET!,
});
