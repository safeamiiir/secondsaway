"use client"

import { useAnimate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import didarha from '../../didarha.json';

// NOTE: Change this date to whatever date you want to countdown to :)
const COUNTDOWN_FROM = didarha.ELEVENTH.time;

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

// Anything further away than this stops being a ticking clock and becomes a
// gentle "a few more Saturdays" kind of wait.
const FRIENDLY_THRESHOLD = WEEK * 3;

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const ShiftingCountdown = () => {
  const distance = useDistance(COUNTDOWN_FROM);

  // Nothing on the very first render so the server and the browser agree.
  if (distance === null) {
    return <div className="p-4"><div className="mx-auto h-24 w-full max-w-5xl rounded-2xl bg-white/5 md:h-36" /></div>;
  }

  if (distance <= 0) {
    return (
      <FriendlyCard
        headline="We're together 🫶"
        subline="No more counting for now."
      />
    );
  }

  if (distance > FRIENDLY_THRESHOLD) {
    return <FarAwayCountdown distance={distance} />;
  }

  return (
    <div className="p-4">
      <p className="mx-auto mb-3 max-w-5xl text-center text-sm font-light text-white/70 md:text-base">
        {closeUpMessage(distance)}
      </p>
      <div className="mx-auto flex w-full max-w-5xl items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/20">
        <CountdownItem unit="Day" text="sleeps" />
        <CountdownItem unit="Hour" text="hours" />
        <CountdownItem unit="Minute" text="minutes" />
        <CountdownItem unit="Second" text="seconds" />
      </div>
    </div>
  );
};

const FarAwayCountdown = ({ distance }) => {
  const saturdays = countSaturdaysBefore(COUNTDOWN_FROM);
  const days = Math.ceil(distance / DAY);
  const target = new Date(COUNTDOWN_FROM);

  return (
    <FriendlyCard
      headline={
        saturdays > 0
          ? `Only ${saturdays} more ${saturdays === 1 ? "Saturday" : "Saturdays"} apart`
          : `Only ${days} more ${days === 1 ? "sleep" : "sleeps"} apart`
      }
      subline={
        saturdays > 0
          ? "and the one after that, we're together 🫶"
          : "and then we're together 🫶"
      }
      footnote={`${DAY_NAMES[target.getDay()]}, ${target.toLocaleDateString(undefined, { day: "numeric", month: "long" })} · about ${days} sleeps away`}
    />
  );
};

const FriendlyCard = ({ headline, subline, footnote }) => (
  <div className="p-4">
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 rounded-2xl bg-white px-6 py-10 text-center shadow-lg shadow-black/20 md:py-14">
      <span className="text-3xl font-semibold text-black md:text-5xl lg:text-6xl">
        {headline}
      </span>
      <span className="text-base font-light text-slate-600 md:text-xl">
        {subline}
      </span>
      {footnote && (
        <span className="mt-2 text-xs font-light uppercase tracking-widest text-slate-400 md:text-sm">
          {footnote}
        </span>
      )}
    </div>
  </div>
);

// A warmer line to sit above the ticking numbers once we're inside three weeks.
const closeUpMessage = (distance) => {
  if (distance < HOUR) return "Almost in each other's arms 🫂";
  if (distance < DAY) return "Today is the day 🎉";
  if (distance < DAY * 2) return "Tomorrow. Actually tomorrow.";
  if (distance < WEEK) return "This week! 🥹";
  if (distance < WEEK * 2) return "Next week we're together 💛";

  const weekends = countSaturdaysBefore(COUNTDOWN_FROM);
  return weekends > 0
    ? `${weekends} more ${weekends === 1 ? "weekend" : "weekends"} apart, then us ✨`
    : "So close now ✨";
};

// Saturdays we still have to spend apart: every Saturday from today up to (but
// not including) the day we meet.
const countSaturdaysBefore = (target) => {
  const meetDay = startOfDay(new Date(target));

  const cursor = startOfDay(new Date());
  cursor.setDate(cursor.getDate() + ((6 - cursor.getDay() + 7) % 7));

  let count = 0;
  while (cursor < meetDay) {
    count++;
    cursor.setDate(cursor.getDate() + 7);
  }

  return count;
};

const startOfDay = (date) => {
  date.setHours(0, 0, 0, 0);
  return date;
};

// Milliseconds left until `to`, or null until the browser has mounted.
const useDistance = (to) => {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const tick = () => setDistance(new Date(to).getTime() - Date.now());

    tick();
    const interval = setInterval(tick, SECOND);

    return () => clearInterval(interval);
  }, [to]);

  return distance;
};

const CountdownItem = ({ unit, text }) => {
  const { ref, time } = useTimer(unit);

  return (
    <div className="flex h-24 w-1/4 flex-col items-center justify-center gap-1 border-r-[1px] border-slate-200 font-mono last:border-r-0 md:h-36 md:gap-2">
      <div className="relative w-full overflow-hidden text-center">
        <span
          ref={ref}
          className="block text-2xl font-medium text-black md:text-4xl lg:text-6xl xl:text-7xl"
        >
          {time}
        </span>
      </div>
      <span className="text-xs font-light text-slate-500 md:text-sm lg:text-base">
        {text}
      </span>
    </div>
  );
};

// NOTE: Framer motion exit animations can be a bit buggy when repeating
// keys and tabbing between windows. Instead of using them, we've opted here
// to build our own custom hook for handling the entrance and exit animations
const useTimer = (unit) => {
  const [ref, animate] = useAnimate();

  const intervalRef = useRef(null);
  const timeRef = useRef(0);

  const [time, setTime] = useState(0);

  useEffect(() => {
    const IsPassed = new Date().getTime() > new Date(COUNTDOWN_FROM).getTime()

    if (!IsPassed) {
      handleCountdown();
      intervalRef.current = setInterval(handleCountdown, 1000);
    }

    return () => clearInterval(intervalRef.current || undefined);
  }, []);

  const handleCountdown = async () => {
    const end = new Date(COUNTDOWN_FROM);
    const now = new Date();
    const distance = +end - +now;

    let newTime = 0;

    if (unit === "Day") {
      newTime = Math.floor(distance / DAY);
    } else if (unit === "Hour") {
      newTime = Math.floor((distance % DAY) / HOUR);
    } else if (unit === "Minute") {
      newTime = Math.floor((distance % HOUR) / MINUTE);
    } else {
      newTime = Math.floor((distance % MINUTE) / SECOND);
    }

    if (newTime !== timeRef.current) {
      // Exit animation
      await animate(
        ref.current,
        { y: ["0%", "-50%"], opacity: [1, 0] },
        { duration: 0.35 }
      );

      timeRef.current = newTime;
      setTime(newTime);

      // Enter animation
      await animate(
        ref.current,
        { y: ["50%", "0%"], opacity: [0, 1] },
        { duration: 0.35 }
      );
    }
  };

  return { ref, time };
};
