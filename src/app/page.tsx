// import Image from "next/image";
import {ShiftingCountdown} from "./components/Countdown";

export default function Home() {
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      // <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      <div>
        <h1 className="text-5xl font-extrabold dark:text-white m-10">
          Seconds away:
        </h1>
        <ShiftingCountdown />
      </div>
      // </main>
    // </div>
  );
}
