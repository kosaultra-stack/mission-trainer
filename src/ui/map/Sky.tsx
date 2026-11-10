import { Earth } from '../art';

/**
 * Небо над базою. На Місяці немає повітря, тож небо чорне навіть удень;
 * уночі Сонце ховається за обрій і зорі стає видно краще.
 */
export function Sky({ isNight }: { isNight: boolean }) {
  return (
    <div className="absolute inset-x-0 top-0 h-[20.2%] overflow-hidden bg-black" aria-hidden>
      <div className={`stars absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-35'}`} />
      <div className={`stars-big anim-twinkle absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-20'}`} />
      <div
        className={`absolute left-[12%] aspect-square h-[34%] rounded-full bg-amber-50 shadow-[0_0_26px_8px_rgba(253,230,138,.6),0_0_90px_36px_rgba(251,191,36,.25)] transition-all duration-[1600ms] ease-in-out ${
          isNight ? 'top-[105%] opacity-0' : 'top-[14%] opacity-100'
        }`}
      />
      <Earth className="absolute right-[12%] top-[8%] h-[52%]" shade={isNight ? 0.55 : 0.3} />
      <svg className="absolute inset-x-0 bottom-0 h-[40%] w-full" viewBox="0 0 800 60" preserveAspectRatio="none">
        <path
          d="M0 60V30Q60 12 130 26T300 20Q380 4 450 22T640 16Q720 8 800 28V60Z"
          className={`transition-colors duration-1000 ${isNight ? 'fill-[#2c3349]' : 'fill-[#9aa3b2]'}`}
        />
        <path
          d="M0 60V44Q90 30 190 42T420 38T650 40T800 42V60Z"
          className={`transition-colors duration-1000 ${isNight ? 'fill-[#23293d]' : 'fill-[#7b8494]'}`}
        />
      </svg>
    </div>
  );
}
