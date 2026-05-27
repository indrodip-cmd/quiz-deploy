const testPayload = {
  name: "Indradip Ghosh",
  email: "indradip161@gmail.com",
  stage: "scaling",
  goal: "$10K+ / month",
  hours: "20+",
  videoSlug: "v3",
  roadmap: `## YOUR SITUATION RIGHT NOW
You are at a critical scaling moment. You have exceptional clarity about your zone of genius, helping women coaches make money, and you are perfectly positioned to serve established business owners aged 45 and up who are desperately seeking scaling strategies. Your biggest vulnerability right now is content consistency.

## YOUR SIGNATURE OFFER
**Offer Name:** The Invisible to $10K Scaling Blueprint
**Tagline:** From content chaos to consistent $10K months in 90 days.
**Format:** 1:1 private coaching plus group calls, 5 months
**Recommended Price:** $5,000 or 5 x $1,100
**Transformation:** FROM feeling invisible and unsure how to scale TO generating consistent $10K monthly revenue through a systematised sales and delivery model.

## YOUR LEAD MAGNET IDEA
**Title:** The 7 Hidden Reasons Women Coaches Plateau at $5K a Month
**Format:** Video quiz plus downloadable PDF
**Why it works:** Your ideal clients are coaches who feel stuck. This speaks directly to their pain and positions you as the diagnostician.

## YOUR DIGITAL PRODUCT IDEA
**Title:** The Coaching Income Accelerator Templates and Scripts
**Format:** Downloadable PDF bundle at $37
**Contents:** Client discovery call script, pricing confidence worksheet, 30-day content calendar template.

## 7-DAY CONTENT PLAN
**Day 1 - Facebook Post:** Hook: Most coaches are charging half what they should. Here is the 3-part pricing formula that changed everything.
**Day 2 - Instagram Reel:** A quick 30-second video showing the three biggest scaling mistakes you see women coaches make.
**Day 3 - Facebook Video:** A 5-minute teaching video called Why Women Coaches Struggle to Charge What They Are Worth.
**Day 4 - Instagram Carousel:** 5 signs your coaching business is ready for $10K months.
**Day 5 - Facebook Post with Image:** Share a data point or stat about women coaches and revenue.
**Day 6 - Instagram Carousel Post:** Share a data point or stat about women coaches and revenue.
**Day 7 - Facebook Live or Recorded Video:** A 10-minute training called Your Scaling Roadmap.

## 30-DAY ACTION PLAN
**Week 1 - Foundation:** Write out your three most powerful transformation stories with specific outcomes and timelines. Set up a simple content calendar template in Google Sheets or Notion with a column for each day, the platform, the topic, and the hook.
**Week 2 - Visibility:** Record all 7 days of content from your content plan in one 4-hour batching session. Shoot them on your phone, use your notes, and get them out of your system.
**Week 3 - Outreach:** Identify and join 20 specific Facebook groups where your ideal client type gathers. Spend 15 minutes daily answering questions and providing value with no pitch.
**Week 4 - Conversion:** Schedule and conduct 5 free 15-minute scaling audit calls with leads from your quiz.

## YOUR PRICING STRATEGY
**Recommended starting price:** $5,000 for the 5-month program
**How to present it:** State the price once, clearly, then stay silent. The pause is part of the close.
**Handling your blocker:** You are confident in your pricing which is your biggest asset. Use that energy on every call.

## YOUR BIGGEST OPPORTUNITY
The single highest-leverage move for you right now is not more content, more followers, or a better website. It is building a consistent daily content habit that compounds over 90 days. You have the expertise, the offer, and the confidence. The missing piece is showing up every single day so the right people can find you.`
}

async function sendTest() {
  const response = await fetch('https://quiz.the5th.consulting/api/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload)
  })
  const data = await response.json()
  console.log('Response:', JSON.stringify(data, null, 2))
  if (data.success) {
    console.log('Email sent successfully. Check indradip161@gmail.com')
  } else {
    console.log('Error:', data.error)
  }
}

sendTest().catch(console.error)
