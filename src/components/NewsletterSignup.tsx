import React from 'react';

export default function NewsletterSignup({ heading, subtext }: { heading: string; subtext: string }) {
  return (
    <div className="newsletter-signup">
      <h3>{heading}</h3>
      <p>{subtext}</p>
      <form
        action="https://api.follow.it/subscription-form/YTNFK294L1dTM1lDYzhxMUlCQkVPTnVTZllwYmpTQUJ3UjkvRzBDOTJJMENYZlpYdDZBRm5uYUVVRTJ6Q3dMTXlCRy96TDg5TjVpQjVod1lUSVBwRzBtNXFmZ1FuSEZJbGZjRkh5bGFGOEJMd2FnMVdwdzNtV3hmTWY5ZlR0OE58c0R0bHkwSHlDTlJnS2VMZ3JyZk5FQWsvbnNDaCtJMmd0dm52bk1JcTlaST0=/8"
        method="post"
        className="newsletter-form"
      >
        <input type="email" name="email" required placeholder="you@example.com" />
        <button type="submit" className="apply-btn">Subscribe</button>
      </form>
      <a href="https://follow.it" className="newsletter-powered-by" target="_blank" rel="noopener noreferrer">
        Powered by follow.it
      </a>
    </div>
  );
}
