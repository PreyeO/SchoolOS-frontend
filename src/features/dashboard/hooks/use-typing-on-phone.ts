"use client";

import { useEffect, useState } from "react";

const TEXT_ENTRY = "input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea, select, [contenteditable=true]";

// True while a text field has focus. The bottom bar hides then: on Android the
// on-screen keyboard shrinks the viewport and a fixed bar rides up on top of
// it, eating a third of what's left — on Score Entry, a teacher typing marks
// down a column would lose sight of the row they're on. Focus is the one
// signal that works on every browser; visualViewport resize alone misses iOS.
export function useTypingOnPhone(): boolean {
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.matches(TEXT_ENTRY)) setTyping(true);
    };
    // focusout fires before the next field's focusin, so moving from one mark
    // to the next would flash the bar; checking activeElement after the
    // event settles avoids that.
    const onFocusOut = () => {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        setTyping(!!active && active.matches(TEXT_ENTRY));
      });
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return typing;
}
