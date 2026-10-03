const btn = 'min-h-[44px] min-w-[44px] rounded-md px-5 py-2 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50';

export default function StepNavigation({
  isFirst, isLast, onPrevious, nextDisabled, busy,
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button type="button" onClick={onPrevious} disabled={isFirst || busy} className={`${btn} border border-primary text-primary`}>
        Previous
      </button>
      <button type="submit" disabled={nextDisabled || busy} className={`${btn} bg-primary text-white`}>
        {isLast ? 'Submit application' : 'Next'}
      </button>
    </div>
  );
}
