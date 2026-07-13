"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Loader2 } from "lucide-react";
import { useEmployeeTimeline } from "../hooks/useEmployeeTimeline";
import { useEmployeeNotes } from "../hooks/useEmployeeNotes";
import { useEmployeeBookmarks } from "../hooks/useEmployeeBookmarks";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { NotesView } from "../components/NotesView";
import { BookmarksView } from "../components/BookmarksView";

export default function EmployeeTimelinePage() {
  const { events, loading, hasMore, total, loadMore } = useEmployeeTimeline(30);
  const { notes, loading: notesLoading, upsertNote } = useEmployeeNotes();
  const { bookmarks, loading: bookmarksLoading } = useEmployeeBookmarks();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Learning History</h1>
        <p className="text-sm text-muted-foreground">
          View your activity timeline, notes, and bookmarks
        </p>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks ({bookmarks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <ActivityTimeline
                events={events}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMore}
                total={total}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <NotesView notes={notes} loading={notesLoading} onSave={upsertNote} />
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-4">
          <BookmarksView bookmarks={bookmarks} loading={bookmarksLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
