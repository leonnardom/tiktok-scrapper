TikTok Profile Scraper
======================

This project is a scraper for TikTok profiles, developed with Node.js and TypeScript, using Puppeteer for browser automation. The scraper collects information about videos and followers from TikTok profiles.

Features
--------

*   **Profile Information Collection:** Retrieves the follower count of a TikTok profile.
*   **Video Details:** Extracts information about posted videos, including views, likes, comments, saves, and video ID.
*   **Simulated Interaction:** Simulates user interaction with the page to avoid bot detection.
*   **Captcha Handling:** Uses the reCAPTCHA plugin to handle captchas automatically.
*   **Comments Extraction:** Retrieves comments for each video, including the author's name and comment text.

Requirements
------------

*   Node.js (v14 or higher)
*   TypeScript
*   `ts-node` (for running TypeScript code directly)
*   `puppeteer-extra`, `puppeteer`, `puppeteer-extra-plugin-stealth`, and `puppeteer-extra-plugin-recaptcha` (for browser automation and captcha handling)
*   `PORT` environment variable (optional)

Installation
------------

Clone the repository and install the dependencies:

    git clone https://github.com/leonnardom/tiktok-scrapper.git
    cd tiktok-scrapper
    npm install

Running the Project
-------------------

To run the project directly in TypeScript, use the following command:

    npx ts-node src/index.ts

For a development environment with automatic reloading, install `ts-node-dev` and run:

    npm run dev

Available Scripts
-----------------

*   `start`: Runs the TypeScript code using `ts-node`.
*   `dev`: Runs the TypeScript code with `ts-node-dev` for development.

API Usage
---------

Send a POST request to the `/scrape` endpoint with a JSON body containing the TikTok profile URL you want to collect information from:

    {
      "url": "username"
    }

### Example Request

    POST http://localhost:3000/scrape
    Content-Type: application/json
    
    {
      "url": "username"
    }

### Example Response

    {
      "success": true,
      "data": {
        "views": 1234567,
        "likes": 234567,
        "comments": 34567,
        "followers": 890123,
        "videos": [
          {
            "id": "1234567890",
            "views": 100000,
            "likes": 5000,
            "comments": 300,
            "saves": 150,
            "description": "Video description",
            "link": "https://www.tiktok.com/@username/video/1234567890",
            "commentsArray": [
              {
                "author": "user1",
                "comment": "Great video!"
              },
              {
                "author": "user2",
                "comment": "Nice content!"
              }
            ]
          }
        ]
      }
    }

The response will include the total counts of views, likes, comments, and followers for the specified TikTok profile, along with detailed information about each video, including comments.

Contributing
------------

Contributions are welcome! If you wish to contribute to this project, please fork the repository and submit a pull request with your changes.

License
-------

This project is licensed under the [MIT License](LICENSE).