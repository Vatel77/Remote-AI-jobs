import React from 'react';
import TrackedOutboundLink from './TrackedOutboundLink';
import { AFFILIATE_PARTNERS } from '@/lib/affiliates';

export default function AffiliateCard({ heading, page }: { heading: string; page: string }) {
  return (
    <div className="affiliate-strip">
      <p className="affiliate-strip-heading">{heading}</p>
      <div className="affiliate-strip-cards">
        {AFFILIATE_PARTNERS.map(partner => (
          <TrackedOutboundLink
            key={partner.id}
            href={partner.url}
            target="_blank"
            rel="sponsored noopener"
            className="affiliate-card"
            eventName="Affiliate Click"
            eventProps={{ partner: partner.id, page }}
          >
            <span className="affiliate-card-name">{partner.name}</span>
            <span className="affiliate-card-tagline">{partner.tagline}</span>
            <span className="affiliate-card-cta">{partner.cta} →</span>
          </TrackedOutboundLink>
        ))}
      </div>
    </div>
  );
}
