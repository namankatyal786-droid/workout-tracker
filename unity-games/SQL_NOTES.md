# 🗄️ DBMS Viva Revision Notes: MiniGameScore & PostgreSQL Queries

> **Subject:** Database Management Systems (DBMS)  
> **Topic:** Relational Schema, Constraints, Indexing, Joins & Aggregations  
> **Database:** PostgreSQL  

---

## 1. DDL: `CREATE TABLE` Equivalent of Prisma Model

The Prisma model:
```prisma
model MiniGameScore {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  game      String
  score     Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([game, score])
  @@index([userId])
}
```

### PostgreSQL Raw DDL Equivalent:

```sql
-- 1. Table Creation with Primary Key, Foreign Key & Domain Check Constraints
CREATE TABLE "MiniGameScore" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "game" VARCHAR(50) NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary Key Constraint
    CONSTRAINT "PK_MiniGameScore" PRIMARY KEY ("id"),

    -- Foreign Key Constraint (Referential Integrity with CASCADE Delete)
    CONSTRAINT "FK_MiniGameScore_User" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,

    -- Check Constraints (Domain Integrity)
    CONSTRAINT "CHK_MiniGameScore_Game" CHECK ("game" IN ('bag-catcher', 'whack-a-mole')),
    CONSTRAINT "CHK_MiniGameScore_Score" CHECK ("score" >= 0)
);

-- 2. Indexes for Query Performance Optimization
-- Composite Index for fast Leaderboard sorting and filtering by game
CREATE INDEX "MiniGameScore_game_score_idx" ON "MiniGameScore" ("game", "score" DESC);

-- Foreign Key Index for fast user-specific lookups
CREATE INDEX "MiniGameScore_userId_idx" ON "MiniGameScore" ("userId");
```

### 🎯 Key Viva Concepts for Table Creation:
* **`UUID PRIMARY KEY`**: Universally unique 128-bit identifier, avoids predictable sequential IDs and prevents enumeration attacks.
* **`FOREIGN KEY ... ON DELETE CASCADE`**: Agar parent `User` record delete hota hai, toh uske saare game scores automatically delete ho jaate hain (prevents orphaned records).
* **`CHECK (game IN (...))`**: Database-level domain integrity check, ensuring only valid game identifiers are stored.
* **`CHECK (score >= 0)`**: Ensures negative scores are impossible at the database storage engine layer.
* **`COMPOSITE INDEX ("game", "score" DESC)`**: Allows PostgreSQL to satisfy leaderboard queries via direct B-Tree index scan without in-memory sorting.

---

## 2. DML: Raw SQL Queries for the 3 API Endpoints

### Endpoint 1: `POST /api/games/scores` (Submit Score)

```sql
INSERT INTO "MiniGameScore" ("id", "userId", "game", "score", "createdAt")
VALUES (
    gen_random_uuid(),
    'c56a4180-65aa-42ec-a945-5fd21dec0538',  -- $1: Logged-in user's UUID
    'bag-catcher',                           -- $2: Validated game name
    120,                                     -- $3: Non-negative score integer
    CURRENT_TIMESTAMP
)
RETURNING *;
```
> **One-Line Explanation:** Inserts a newly achieved score record linked to the user via foreign key `userId`, generating a fresh UUID primary key and timestamp.

---

### Endpoint 2: `GET /api/games/my-best` (User's Best Score Per Game)

```sql
SELECT 
    "game", 
    MAX("score") AS "bestScore"
FROM "MiniGameScore"
WHERE "userId" = 'c56a4180-65aa-42ec-a945-5fd21dec0538'
GROUP BY "game";
```
> **One-Line Explanation:** Groups all score rows for the logged-in user by `game` and applies the `MAX()` aggregate function to retrieve the player's personal record in each game.

---

### Endpoint 3: `GET /api/games/leaderboard/:game` (Top 10 Global Players)

```sql
SELECT 
    u."name" AS "username", 
    MAX(s."score") AS "bestScore"
FROM "MiniGameScore" s
INNER JOIN "User" u ON s."userId" = u."id"
WHERE s."game" = 'bag-catcher'
GROUP BY u."id", u."name"
ORDER BY "bestScore" DESC
LIMIT 10;
```
> **One-Line Explanation:** Joins `MiniGameScore` with `User` on `userId`, groups by each unique user to get their personal best, sorts highest first using `ORDER BY DESC`, and limits results to the top 10.

---

## 3. Quick Viva Q&A Cheat Sheet

| Question | Answer |
|---|---|
| **Why use `INNER JOIN` in leaderboard?** | Leaderboard requires displaying the user's readable name (`u.name`), which lives in the `User` table, while the scores live in `MiniGameScore`. |
| **Why `GROUP BY u.id, u.name` instead of just `u.name`?** | Multiple users could have the same name. Grouping by primary key `u.id` guarantees unique aggregation per actual user account. |
| **Why is an index needed on `("game", "score")`?** | Without this index, PostgreSQL would perform a full sequential table scan (O(N)) and sort all rows. With this composite index, it reads the top 10 directly in O(log N) time. |
| **What happens if a user is deleted?** | Because of `ON DELETE CASCADE`, all rows in `MiniGameScore` matching that user's `userId` are automatically deleted by PostgreSQL. |
