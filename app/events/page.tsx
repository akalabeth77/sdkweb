import { fetchPortalData } from '@/lib/social';
import { getServerMessages } from '@/lib/i18n-server';
import { getEventCategoryLabel } from '@/lib/i18n';
import { EventsExplorer } from '@/components/events-explorer';

export const revalidate = 900;

export default async function EventsPage() {
  const { locale, t } = getServerMessages();
  const { events } = await fetchPortalData();
  const categoryLabels = [
    { value: 'course' as const, label: getEventCategoryLabel(locale, 'course') },
    { value: 'dance-party' as const, label: getEventCategoryLabel(locale, 'dance-party') },
    { value: 'workshop' as const, label: getEventCategoryLabel(locale, 'workshop') },
    { value: 'festival' as const, label: getEventCategoryLabel(locale, 'festival') },
    { value: 'concert' as const, label: getEventCategoryLabel(locale, 'concert') },
    { value: 'other' as const, label: getEventCategoryLabel(locale, 'other') },
  ];

  return (
    <EventsExplorer
      events={events}
      locale={locale}
      categoryLabels={categoryLabels}
      labels={{
        title: t.events.title,
        description: t.events.description,
        currentMonth: t.events.currentMonth,
        calendarTitle: t.events.calendarTitle,
        previousMonth: t.events.previousMonth,
        nextMonth: t.events.nextMonth,
        month: t.events.month,
        year: t.events.year,
        noEventsThisMonth: t.events.noEventsThisMonth,
        shareEvent: t.events.shareEvent,
        filterLabel: t.events.filterLabel,
        filterAll: t.events.filterAll,
        selectedDay: t.events.selectedDay,
        clearDayFilter: t.events.clearDayFilter,
        readMore: t.events.readMore,
        copyLink: t.common.copyLink,
        copied: t.common.copied,
      }}
    />
  );
}
