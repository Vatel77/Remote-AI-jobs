"use client";
import React from 'react';
import { track } from '@vercel/analytics';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventProps?: Record<string, string | number | boolean | null>;
};

// Plain outbound <a> that also fires a Vercel Analytics custom event.
// No navigation is delayed or intercepted — target="_blank" links open
// immediately, the beacon is fire-and-forget.
export default function TrackedOutboundLink({ eventName, eventProps, onClick, ...anchorProps }: Props) {
  return (
    <a
      {...anchorProps}
      onClick={(e) => {
        track(eventName, eventProps);
        onClick?.(e);
      }}
    />
  );
}
