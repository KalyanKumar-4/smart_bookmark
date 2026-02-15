
# Smart Bookmark App

A simple, real-time bookmark manager where users can:

* Sign in using Google OAuth
* Add bookmarks (title + URL)
* View only their own bookmarks
* See updates instantly across multiple tabs
* Delete their bookmarks

Deployed on Vercel.

---

# Tech Stack

* **Next.js (App Router)**
* **Supabase (Auth + Database + Realtime)**
* **Google OAuth**
* **Tailwind CSS**
* **Vercel (Deployment)**

---

#  Architecture Overview

* Authentication handled via Supabase with Google OAuth only.
* Bookmarks stored in Supabase Postgres.
* Row-Level Security (RLS) ensures bookmarks are private per user.
* Supabase Realtime listens to database changes and updates UI instantly.
* App Router used for clean client-side rendering with session handling.

---

#  Security Decisions

* RLS enabled on `bookmarks` table.
* Policies restrict:

  * SELECT → Only user's own data
  * INSERT → Only with matching user_id
  * DELETE → Only own records
* No service role key exposed on frontend.
* Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` used.

---

#  Realtime Implementation

Used Supabase `postgres_changes` subscription to listen for:

* INSERT
* DELETE
* UPDATE

Filtered by `user_id` to prevent cross-user data exposure.

---

# Problems I Faced & How I Solved Them

## 1️ Realtime WebSocket Failing

**Problem:**
WebSocket connection closed before being established.

**Cause:**
The `bookmarks` table was not added to Supabase replication.

**Solution:**
Enabled replication in Supabase dashboard under Database → Replication and added the table to `supabase_realtime` publication.

---

## 2️ Realtime Not Respecting User Privacy

**Problem:**
Initial subscription listened to all table changes.

**Risk:**
Could potentially attempt to subscribe to other users' changes.

**Solution:**
Added filter to subscription:

```
filter: user_id=eq.${user.id}
```

This ensured the client only listens to its own records.

---

## 3️ Google OAuth Redirect Issues in Production

**Problem:**
Login worked locally but failed on Vercel.

**Cause:**
Production domain was not added to:

* Supabase URL configuration
* Google Cloud OAuth authorized origins

**Solution:**
Added Vercel domain to:

* Supabase Auth settings
* Google OAuth credentials

---

## 4️ Incorrect Root Directory on Vercel

**Problem:**
Vercel build failed.

**Cause:**
Next.js app was inside a subfolder.

**Solution:**
Configured Vercel Root Directory to `smart-bookmarks`.

---

## 5️ RLS Blocking Realtime

**Problem:**
Data not appearing in real-time updates.

**Cause:**
RLS policy missing SELECT permission for authenticated users.

**Solution:**
Added explicit SELECT policy:

```sql
create policy "Users can view own bookmarks"
on bookmarks
for select
using (auth.uid() = user_id);
```

---

# Improvements I Would Add Next

* Input validation for URLs
* Loading states
* Optimistic UI updates
* Pagination for large bookmark lists
* Edit bookmark feature
* Better UI feedback for errors

---

#  Live Demo

Vercel URL:
`https://smartbookmarks-two.vercel.app/`

---

#  What This Project Demonstrates

* Secure multi-user architecture
* Proper use of RLS
* Realtime system handling
* OAuth integration
* Production deployment workflow
* Debugging third-party integration issues

---
