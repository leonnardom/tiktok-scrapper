import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import dotenv from 'dotenv';
import { Page } from 'puppeteer';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

interface VideoInfo {
  views: number;
  likes: number;
  comments: number;
  saves: number;
  link?: string;
  description?: string;
}

async function simulateHumanInteraction(page: Page) {
  await page.mouse.move(100, 100);
  await page.waitForTimeout(2000);
  await page.mouse.move(200, 200);
  await page.waitForTimeout(2000);
  await page.mouse.move(300, 300);
  await page.waitForTimeout(2000);
}

function parseNumber(numberString: string): number {
  let number = parseFloat(numberString.replace(/,/g, ''));
  if (numberString.includes('k') || numberString.includes('K')) {
    number *= 1000;
  } else if (numberString.includes('M')) {
    number *= 1000000;
  }
  return isNaN(number) ? 0 : Math.round(number);
}

async function getTikTokProfileInfo(
  username: string
): Promise<{ videos: VideoInfo[]; followers: number }> {
  await puppeteer.use(Stealth());
  await puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: '5325b7f39b2910d44f5e6a4c6ad6b1bf'
      },
      visualFeedback: true
    })
  );

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    const url = `https://www.tiktok.com/@${username}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await simulateHumanInteraction(page);

    await autoScroll(page);

    await page.waitForTimeout(5000);

    const followerSelector = 'strong[data-e2e="followers-count"]';
    try {
      await page.waitForSelector(followerSelector, { timeout: 120000 });
    } catch (error) {
      console.error(
        'Follower selector not found within the timeout period:',
        error
      );
      return { videos: [], followers: 0 };
    }

    const followers = await page.evaluate((selector: string) => {
      const parseNumber = (numberString: string): number => {
        let number = parseFloat(numberString.replace(/,/g, ''));
        if (numberString.includes('k') || numberString.includes('K')) {
          number *= 1000;
        } else if (numberString.includes('M')) {
          number *= 1000000;
        }
        return isNaN(number) ? 0 : Math.round(number);
      };

      const followerElement = document.querySelector(selector);
      const followers = followerElement ? followerElement.textContent : '0';
      return parseNumber(followers || '0');
    }, followerSelector);

    const videoSelector = "div[data-e2e='user-post-item']";
    try {
      await page.waitForSelector(videoSelector, { timeout: 120000 });
    } catch (error) {
      console.error(
        'Video selector not found within the timeout period:',
        error
      );
      return { videos: [], followers };
    }

    const videoData: VideoInfo[] = await page.evaluate((selector: string) => {
      const parseNumber = (numberString: string): number => {
        let number = parseFloat(numberString.replace(/,/g, ''));
        if (numberString.includes('k') || numberString.includes('K')) {
          number *= 1000;
        } else if (numberString.includes('M')) {
          number *= 1000000;
        }
        return isNaN(number) ? 0 : Math.round(number);
      };

      const videoElements = document.querySelectorAll(selector);
      const data: VideoInfo[] = [];
      videoElements.forEach(element => {
        const viewsElement = element.querySelector('strong');
        const views = viewsElement ? viewsElement.textContent : '0';
        const linkElement = element.querySelector('a');
        const link = linkElement ? linkElement.href : '';
        data.push({
          views: parseNumber(views || '0'),
          likes: 0,
          comments: 0,
          saves: 0,
          description: '', // Placeholder for description
          link
        });
      });
      return data;
    }, videoSelector);

    for (const video of videoData) {
      try {
        await page.goto(video.link || '', {
          waitUntil: 'networkidle2',
          timeout: 60000
        });

        await page.waitForTimeout(3000);

        const likesSelector = 'strong[data-e2e="like-count"]';
        const commentsSelector = 'strong[data-e2e="comment-count"]';
        const savesSelector = 'strong[data-e2e="favorite-count"]';
        const descriptionSelector = 'div[data-e2e="video-description"]'; // Atualize o seletor conforme necessário

        const likes = await page.evaluate(likesSelector => {
          const parseNumber = (numberString: string): number => {
            let number = parseFloat(numberString.replace(/,/g, ''));
            if (numberString.includes('k') || numberString.includes('K')) {
              number *= 1000;
            } else if (numberString.includes('M')) {
              number *= 1000000;
            }
            return isNaN(number) ? 0 : Math.round(number);
          };

          const likesElement = document.querySelector(likesSelector);
          return likesElement
            ? parseNumber(likesElement.textContent || '0')
            : 0;
        }, likesSelector);

        const comments = await page.evaluate(commentsSelector => {
          const parseNumber = (numberString: string): number => {
            let number = parseFloat(numberString.replace(/,/g, ''));
            if (numberString.includes('k') || numberString.includes('K')) {
              number *= 1000;
            } else if (numberString.includes('M')) {
              number *= 1000000;
            }
            return isNaN(number) ? 0 : Math.round(number);
          };

          const commentsElement = document.querySelector(commentsSelector);
          return commentsElement
            ? parseNumber(commentsElement.textContent || '0')
            : 0;
        }, commentsSelector);

        const saves = await page.evaluate(savesSelector => {
          const parseNumber = (numberString: string): number => {
            let number = parseFloat(numberString.replace(/,/g, ''));
            if (numberString.includes('k') || numberString.includes('K')) {
              number *= 1000;
            } else if (numberString.includes('M')) {
              number *= 1000000;
            }
            return isNaN(number) ? 0 : Math.round(number);
          };

          const savesElement = document.querySelector(savesSelector);
          return savesElement
            ? parseNumber(savesElement.textContent || '0')
            : 0;
        }, savesSelector);

        const description = await page.evaluate(descriptionSelector => {
          const descriptionElement =
            document.querySelector(descriptionSelector);
          return descriptionElement ? descriptionElement.textContent || '' : '';
        }, descriptionSelector);

        video.likes = likes;
        video.comments = comments;
        video.saves = saves;
        video.description = description;
      } catch (error) {
        console.error(
          `Failed to process video ${video.link}: ${(error as Error).message}`
        );
        video.likes = 0;
        video.comments = 0;
        video.saves = 0;
        video.description = '';
      } finally {
        await page.goBack();
      }
    }

    return { videos: videoData, followers };
  } catch (error) {
    console.error('Error in getTikTokProfileInfo:', error);
    return { videos: [], followers: 0 };
  } finally {
    await browser.close();
  }
}

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>(resolve => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

app.post('/scrape', async (req: Request, res: Response) => {
  console.log(`\x1b[34m[SCRAPPER]\x1b[0m`, `Starting Scrapper.`);

  const { url } = req.body;

  console.log(`\x1b[34m[NEW POST]\x1b[0m`, `New Post using URL: ${url}`);

  const profileInfo = await getTikTokProfileInfo(url);

  const totalViews = profileInfo.videos.reduce(
    (acc, video) => acc + video.views,
    0
  );

  const totalLikes = profileInfo.videos.reduce(
    (acc, video) => acc + video.likes,
    0
  );

  const totalComments = profileInfo.videos.reduce(
    (acc, video) => acc + video.comments,
    0
  );

  res.json({
    success: true,
    data: {
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      followers: profileInfo.followers,
      videos: profileInfo.videos // Incluindo os dados dos vídeos
    }
  });
});

app.listen(PORT, () =>
  console.log(`\x1b[34m[PORT]\x1b[0m`, `Server is running on port ${PORT}`)
);
