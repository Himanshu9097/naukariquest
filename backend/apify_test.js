const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software+engineer&location=Worldwide&f_TPR=r604800&start=0`;
        const { data: html } = await axios.get(url, {
           headers: {
             'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
             'Accept-Language': 'en-US,en;q=0.9',
           }
        });
        const $ = cheerio.load(html);
        const externalJobs = [];
        $('.job-search-card').each((_, el) => {
            const title = $(el).find('.base-search-card__title').text().trim();
            if (title) externalJobs.push(title);
        });
        console.log("Success! Found:", externalJobs.length);
        console.log("Jobs:", externalJobs.slice(0,2));
    } catch (e) {
        console.log(`Failed:`, e.message);
    }
}
run();
