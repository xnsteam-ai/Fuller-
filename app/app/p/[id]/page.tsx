'use client';
import { use, useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { PreviewFrame } from '@/components/PreviewFrame';
import { getProject } from '@/lib/store';
import type { Project } from '@/lib/types';

export default function Canvas({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  useEffect(() => setProject(getProject(id) ?? null), [id]);
  return (
    <Shell title={project?.name ?? 'Design'} back="/">
      {project === undefined && <div className="h-64 animate-pulse rounded-lg bg-surface" />}
      {project === null && <p className="rounded-md border border-border p-4">This project was not found on this device.</p>}
      {project && (
        <div className="grid gap-6">
          {project.screens.map((s, i) => (
            <section key={s.id} aria-label={`Screen ${i + 1} of ${project.screens.length}: ${s.title}`} className="grid gap-2">
              <h2 className="text-sm font-semibold text-text-muted">{i + 1} / {project.screens.length} · {s.title}</h2>
              <PreviewFrame html={s.html} title={s.title} />
            </section>
          ))}
        </div>
      )}
    </Shell>
  );
}
