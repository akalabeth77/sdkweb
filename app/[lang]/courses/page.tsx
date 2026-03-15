import { safeFetch } from '@/lib/sanity.client';
import { coursesQuery } from '@/lib/queries';
import { Course } from '@/types';
import { Locale } from '@/lib/i18n';

export default async function CoursesPage({ params }: { params: { lang: Locale } }) {
  const courses: Course[] = await safeFetch<Course[]>(coursesQuery, {}, []);
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{params.lang === 'sk' ? 'Kurzy' : 'Courses'}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <article key={course._id} className="card">
            <h2 className="text-xl font-semibold">{course.name[params.lang]}</h2>
            <p>{course.danceStyle} · {course.level}</p>
            <p>{course.weekday} {course.time} · {course.duration}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
