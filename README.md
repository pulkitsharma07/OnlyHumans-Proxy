<div align="center">
  <picture>
    <img src="public/logo.png" width=50% height=50%>
  </picture>
</div>
<h3 align="center">An Experimental AntiBot Reverse Proxy </h3>
<p align="center">Serve your static website as image(s) so that crawlers, bots, etc cannot steal/scrape/take your content   ✊🧔✊ </p>


## Purpose
This is a completely experimental Proof-Of-Concept to see if we can serve websites in a way wherein the bots have to do more work instead of humans to access the contents of a web page.

Traditional approaches use captchas, or other sophisticated bot detection methods to prevent unwanted crawlers/bots to scrape or access your website, but that:
* incurs an unnecessary cognitive load on humans (more so on those who do not use "popular" browsers)
* Requires dependency on paid providers like Cloudflare, DataDome..
* Constant battle against newest browser automation protocols/workaround, managing IP ban lists, etc.

`Crawling As a Service` is on the rise, LLM models are being freely trained on the text data of the web...No one honours `robots.txt` anymore, we need better approaches to control who gets access to human generated content. Using this proxy you can take your existing website* and serve it to humans, `OnlyHumans`.

*Refer to [FAQ](#FAQ) section below.

## Demo
In the demo below, you can see [HN](https://news.ycombinator.com/) being served via OnlyHumans. There are large watermarks displayed on the page as to not confuse it with the actual HN website. Current version supports clicking on links, i.e. HTML `<a>` tags. On accessing the page or clicking on a link you get a `png` back from the server instead of a traditional `HTML/JS/CSS` response.

https://github.com/user-attachments/assets/603a80b8-93ee-465a-8e7e-a17c37990853

## How it works ?
<img width="1369" alt="Screenshot 2024-09-29 at 10 33 25 PM" src="https://github.com/user-attachments/assets/0e544776-5bd4-4ad6-a0c9-9794b69cf59d">

## Running Locally
* `ORIGIN_URL="<your-website.com>" make run`, then access any of the url shown in the logs lines like this to access your OnlyHumans instance.
  ```
  > vite preview --host

  ➜  Local:   http://localhost:4173/
  ➜  Network: http://192.168.1.4:4173/
  ```
* On opening this page in the browser, the contents of the `ORIGIN_URL` should show up (as an image instead).
* For running in dev mode use `run_dev` instead of `run` in the make command.
  
## FAQ
> What kind of websites are supported as the `ORIGIN_URL` ?

OnlyHumans uses `puppeteer` to open the `ORIGIN_URL`, Although `puppeteer` supports pretty much all kinds of websites, OnlyHumans currently is usable only for static websites which have `link` (`<a>` href) based navigation and doesn't have any dynamic media (videos, etc). Give it a try and let me know...

> Why not just stream the contents of the `puppeteer` browser to the client instead of taking a screenshot ?

Yes this can be done, maybe future versions should go in this direction, but I am not inclined due to unnecessary resource overheads of streaming on the servers. Also I am not sure how will caching work with realtime streaming. The current architecture of serving `png` images will utilise the existing global CDN infrastructure.

> How can we support dynamic content/interactivity ?

One crude idea is to move all your static content behind OnlyHumans and serve that as `iframes` on your page. So comment sections, or other fancy JS interactivity stuff can be done using regular web frameworks, but while serving any human generated content you can use an `iframe` which points to your OnlyHumans instance.

> This will not prevent scraping, scrapers can use OCR ...

Yes, definitely they can use it, but OCR is resource intensive as compared to parsing HTML and extracting data from it. So scaling a OCR based scraping project will be a lot more expensive than a regular scraper. Also OnlyHumans can be modified to add multiple layers of obfuscation/noise techniques to fool OCR tools. at the same time keeping content readable for humans. Check this for reference https://github.com/tesseract-ocr/tesseract/issues/1700 
