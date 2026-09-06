# 📩 Outreach Playbook: Broken WhatsApp Link Preview & Missing OpenGraph Tags
### *Standard Operating Procedure (SOP) & Templates for Flagging Blank/Broken Social Preview Cards*

---

## 📌 Trigger Condition & Use Case
* **The Error:** A prospect's website does not configure OpenGraph meta tags (`og:image`, `og:title`, `og:description`).
* **Visual Evidence:** When their domain (`company.ae`) is typed or shared into a WhatsApp/LinkedIn chat, it generates an **empty, blank gray rectangle** with no logo or photo.
* **Why this converts:** It provides 100% visual proof via screenshot, educates them on word-of-mouth referral leaks, encourages them to consult their current agency first, and positions Flick as the competent fallback partner.

---

## 📧 Template 1: The Executive Email

* **Target Inboxes:** `concierge@`, `marketing@`, `info@`, or direct founder/MD email.
* **Subject Line Options:**
  * `Digital audit note for {{WEBSITE_URL}} – WhatsApp preview issue (Screenshot attached)`
  * `Quick visual glitch on {{WEBSITE_URL}} link preview card (Screenshot attached)`
* **Attachment:** Attach the screenshot showing their blank preview card vs. a rich preview card.

```markdown
Dear {{FOUNDER_OR_TEAM_NAME}},

I hope you are having a productive week.

We are Flick Studio (theflickstudio.ae), a Dubai-based creative and digital agency. As part of our work optimizing online presence for leading UAE brands, we recently ran a mobile experience and digital health audit on {{WEBSITE_URL}}.

During the review, we noticed a visual error that directly affects word-of-mouth referrals:

The Issue:
When your website link is shared on WhatsApp, it currently generates a blank, empty gray box with no brand imagery, title, or description (as shown in the attached screenshot). Because your website is missing OpenGraph meta tags (og:image), messaging apps cannot render your luxury branding when clients recommend you to friends.

Recommended Action:
We recommend forwarding this email and screenshot directly to your current web agency or developer so they can patch this into your site's header code.

If your existing agency is unavailable or cannot resolve this for you, you are welcome to reach out to our team at Flick (hello@flickcontent.com / WhatsApp: +971 56 189 2990), and we would be glad to assist.

Best regards,

{{YOUR_NAME}}
Flick Studio | Dubai, UAE
```

---

## 💬 Template 2: Direct WhatsApp Message

* **Target Numbers:** Official WhatsApp Business line, Clinic/Company mobile concierge (`+971 5x...`).
* **Action:** Send the screenshot first, immediately followed by this text.

```markdown
Salam team! Hope you're having a great week.

We’re Flick Studio (theflickstudio.ae) here in Dubai — we specialize in optimizing online presence and digital infrastructure for local brands.

While running a digital check on {{WEBSITE_URL}}, we spotted a small visual bug: whenever your link is shared on WhatsApp, it shows a blank gray preview box instead of your brand's photo and headline (see screenshot above).

This happens due to missing OpenGraph tags in the website code.

We suggest forwarding this screenshot to your current web agency so they can update it for you right away.

If your current agency is unavailable or you need any support getting it fixed, feel free to get in touch with us here at Flick (+971 56 189 2990), and we'll be happy to help.
```

---

## 📸 Template 3: Instagram Direct Message (DM)

* **Target Account:** Official verified Instagram handle (`@brand`).

```markdown
Hey {{BRAND_NAME}} team! Love the content on your page 🙌

Quick heads-up: while checking out your website ({{WEBSITE_URL}}), we noticed a small glitch where sharing your link on WhatsApp generates a blank gray box with no preview photo.

We put together a screenshot and quick fix note. Feel free to pass it to your current web agency to patch! If your team needs a hand or you'd like us to take a look, just let us know — happy to help out local Dubai brands. 🚀
```

---

## 🛠️ The Technical Fix (To Provide If They Request Support)

If the prospect replies asking *"How do we fix this?"*, provide this clean 4-line snippet:

```html
<!-- Place inside the <head> section of index.html / header template -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.{{DOMAIN}}/" />
<meta property="og:title" content="{{BRAND_NAME}} | {{TAGLINE_OR_SPECIALTY}}" />
<meta property="og:description" content="{{ONE_SENTENCE_VALUE_PROPOSITION}}" />
<meta property="og:image" content="https://www.{{DOMAIN}}/assets/og-preview-card.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

---

## 📋 SOP Checklist for Sales Team

1. **Step 1: Capture Proof**  
   Open WhatsApp on desktop/mobile, paste the prospect's URL into your own chat/notes, wait 2 seconds for the preview box to render, and take a clean screenshot.
2. **Step 2: Dual Outreach**  
   Send the Email to `concierge@` or `info@`, and send the WhatsApp version with the screenshot to their `+971 5...` mobile line.
3. **Step 3: Response Handling**  
   * *If they forward to their agency:* They will remember Flick's generosity. Follow up in 14 days if still unpatched.
   * *If they ask Flick to fix it:* Offer to patch it in 24 hours for a small introductory fee or bundle it into a complete digital presence optimization retainer.
